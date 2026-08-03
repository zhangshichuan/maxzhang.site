"""TTS 流式合成服务

职责：
- 接收文章纯文本，使用 edge-tts 实时合成为 MP3 并流式返回
- 以文本 SHA-256 为缓存键：文章内容变化 → hash 变化 → 自动重新生成
- 支持 Range 请求（浏览器进度条/拖动），缓存满 30 天或超过 1GB 自动清理

接口：
- GET  /tts/{hash}?voice=...   命中缓存则返回音频（支持 Range），未命中 404
- POST /tts/{hash}             请求体 {text, voice}，实时合成并流式返回
- GET  /healthz                健康检查
"""

from __future__ import annotations

import asyncio
import hashlib
import os
import re
import time
from pathlib import Path

import edge_tts
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from contextlib import asynccontextmanager
import uuid

CACHE_DIR = Path(os.environ.get("TTS_CACHE_DIR") or "./.cache/tts")
CACHE_MAX_BYTES = int(os.environ.get("TTS_CACHE_MAX_BYTES", str(1024**3)))
CACHE_MAX_AGE_SECONDS = int(os.environ.get("TTS_CACHE_MAX_AGE_SECONDS", str(30 * 24 * 3600)))
CLEANUP_INTERVAL_SECONDS = int(os.environ.get("TTS_CLEANUP_INTERVAL_SECONDS", str(10 * 60)))
MAX_TEXT_LENGTH = int(os.environ.get("TTS_MAX_TEXT_LENGTH", str(60_000)))
CHUNK_SIZE = 8000

VOICES = {
    "zh": "zh-CN-XiaoxiaoNeural",
    "en": "en-US-JennyNeural",
}

@asynccontextmanager
async def lifespan(_: FastAPI):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    # 启动时清掉上次进程残留的临时文件
    for tmp in CACHE_DIR.rglob("*.tmp"):
        tmp.unlink(missing_ok=True)
    cleanup_task = asyncio.create_task(cleanup_loop())
    yield
    cleanup_task.cancel()


app = FastAPI(title="MaxZhang TTS", version="1.0.0", lifespan=lifespan)


class TtsRequest(BaseModel):
    text: str
    voice: str = "zh-CN-XiaoxiaoNeural"


# 每个 hash 一把生成锁：避免并发请求写同一个缓存文件
_generation_locks: dict[str, asyncio.Lock] = {}


def strip_mdx(content: str) -> str:
    """去除 MDX/markdown 语法，提取纯文本（与旧生成脚本一致）"""
    text = content
    text = re.sub(r"^---.*?---\n", "", text, flags=re.DOTALL)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"__([^_]+)__", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"_([^_]+)_", r"\1", text)
    text = re.sub(r"```[\s\S]*?```", "", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"!\[.*?\]\([^)]+\)", "", text)
    text = re.sub(r"^[-*+]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\d+\.\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"---", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def preprocess_for_tts(text: str) -> str:
    """TTS 友好预处理：全大写缩写拆成字母逐个朗读"""
    return re.sub(r"([A-Z])(?=[A-Z])", r"\1 ", text)


def split_into_chunks(text: str, chunk_size: int = CHUNK_SIZE) -> list[str]:
    """按句子边界切分长文本，适配 edge-tts 的分片合成"""
    if len(text) <= chunk_size:
        return [text]

    sentences = re.split(r"(?<=[。！？\n.!?])\s*", text)
    chunks: list[str] = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) <= chunk_size:
            current += sentence
        else:
            if current.strip():
                chunks.append(current.strip())
            current = sentence

    if current.strip():
        chunks.append(current.strip())

    return chunks


def text_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def cache_path(hash_value: str) -> Path:
    # 分目录避免单目录文件过多
    return CACHE_DIR / hash_value[:2] / f"{hash_value}.mp3"


def parse_range(range_header: str, file_size: int) -> tuple[int, int] | None:
    """解析单区间 Range，返回 (start, end)，非法返回 None"""
    if not range_header or not range_header.startswith("bytes="):
        return None
    spec = range_header[6:].split(",")[0].strip()
    if "-" not in spec:
        return None

    start_str, end_str = spec.split("-", 1)
    try:
        if start_str == "":
            # 后缀范围: bytes=-N
            suffix = int(end_str)
            if suffix <= 0:
                return None
            return (max(0, file_size - suffix), file_size - 1)

        start = int(start_str)
        end = int(end_str) if end_str else file_size - 1
        if start < 0 or start >= file_size:
            return None
        return (start, min(end, file_size - 1))
    except ValueError:
        return None


def serve_file(hash_value: str, range_header: str | None = None) -> Response:
    """从缓存读取音频，支持 Range"""
    path = cache_path(hash_value)
    if not path.exists() or path.stat().st_size == 0:
        raise HTTPException(status_code=404, detail="cache miss")

    file_size = path.stat().st_size
    range_spec = parse_range(range_header, file_size)

    if range_spec is None:
        return Response(
            path.read_bytes(),
            media_type="audio/mpeg",
            headers={
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=86400",
            },
        )

    start, end = range_spec
    data = path.read_bytes()[start : end + 1]
    return Response(
        data,
        status_code=206,
        media_type="audio/mpeg",
        headers={
            "Accept-Ranges": "bytes",
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Cache-Control": "public, max-age=86400",
        },
    )


@app.get("/healthz")
async def healthz() -> dict:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return {"ok": True}


@app.get("/tts/{hash_value}")
async def get_tts(hash_value: str, request: Request) -> Response:
    if not re.fullmatch(r"[0-9a-f]{64}", hash_value):
        raise HTTPException(status_code=400, detail="invalid hash")
    return serve_file(hash_value, request.headers.get("range"))


@app.post("/tts/{hash_value}")
async def post_tts(hash_value: str, payload: TtsRequest) -> Response:
    if not re.fullmatch(r"[0-9a-f]{64}", hash_value):
        raise HTTPException(status_code=400, detail="invalid hash")

    text = preprocess_for_tts(strip_mdx(payload.text))
    if not text:
        raise HTTPException(status_code=400, detail="empty text")
    if len(text) > MAX_TEXT_LENGTH:
        raise HTTPException(status_code=400, detail="text too long")
    if text_hash(text) != hash_value:
        raise HTTPException(status_code=400, detail="hash mismatch")
    if payload.voice not in VOICES.values():
        raise HTTPException(status_code=400, detail="unknown voice")

    target = cache_path(hash_value)
    if target.exists() and target.stat().st_size > 0:
        return serve_file(hash_value)

    lock = _generation_locks.setdefault(hash_value, asyncio.Lock())

    # 已在生成中：立刻返回 409，由调用方轮询缓存
    if lock.locked():
        raise HTTPException(status_code=409, detail="generation in progress")

    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_name(f"{hash_value}.{uuid.uuid4().hex}.tmp")

    async def generate():
        await lock.acquire()
        try:
            if target.exists() and target.stat().st_size > 0:
                yield target.read_bytes()
                return
            with tmp.open("wb") as f:
                for chunk in split_into_chunks(text):
                    communicate = edge_tts.Communicate(chunk, payload.voice, rate="+10%")
                    async for audio_chunk in communicate.stream():
                        if audio_chunk["type"] == "audio":
                            data = audio_chunk["data"]
                            f.write(data)
                            yield data
            tmp.replace(target)
        except Exception:
            tmp.unlink(missing_ok=True)
            raise
        finally:
            lock.release()

    return StreamingResponse(
        generate(),
        media_type="audio/mpeg",
        headers={"Cache-Control": "public, max-age=86400"},
    )


async def cleanup_loop():
    """定期清理：过期文件 + 总量超限时按最旧删除"""
    while True:
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)
        try:
            # 残留 .tmp（进程被杀/请求中断）超过 1 小时删除
            now = time.time()
            for tmp in CACHE_DIR.rglob("*.tmp"):
                if now - tmp.stat().st_mtime > 3600:
                    tmp.unlink(missing_ok=True)

            files = [
                p
                for p in CACHE_DIR.rglob("*.mp3")
                if p.is_file() and not p.name.endswith(".tmp")
            ]
            expired = [p for p in files if now - p.stat().st_mtime > CACHE_MAX_AGE_SECONDS]
            for p in expired:
                p.unlink(missing_ok=True)

            remaining = sorted(
                (p for p in files if p not in expired),
                key=lambda p: p.stat().st_mtime,
            )
            total = sum(p.stat().st_size for p in remaining)
            for p in remaining:
                if total <= CACHE_MAX_BYTES:
                    break
                total -= p.stat().st_size
                p.unlink(missing_ok=True)
        except Exception:
            # 清理失败不影响主服务
            pass
