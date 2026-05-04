#!/usr/bin/env python3
"""生成文章语音播报音频（增量：跳过已存在的文件）

用法:
    python3 scripts/generate-audio.py              # 生成所有中英文文章
    python3 scripts/generate-audio.py zh            # 仅中文
    python3 scripts/generate-audio.py zh my-article  # 单篇

依赖: pip install edge-tts
"""

import asyncio
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
ARTICLES_DIR = ROOT / "articles"
AUDIO_DIR = ROOT / "public" / "audio"

LANG_VOICES = {
    "zh": {
        "xiaoxiao": "zh-CN-XiaoxiaoNeural",   # 女声 - 温柔
    },
    "en": {
        "jenny": "en-US-JennyNeural",         # 女声
    },
}


def strip_mdx(content: str) -> str:
    """去除 MDX/markdown 语法，提取纯文本"""
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
    """TTS 友好的文本预处理：将全大写缩写拆成字母逐个朗读"""
    text = re.sub(r"([A-Z])(?=[A-Z])", r"\1 ", text)
    return text


async def generate_audio(text: str, voice: str, output_path: Path, timeout: int = 120):
    """使用 edge-tts 生成语音文件，带超时和残留文件清理"""
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate="+10%")
    try:
        await asyncio.wait_for(communicate.save(str(output_path)), timeout=timeout)
    except (asyncio.TimeoutError, asyncio.CancelledError, KeyboardInterrupt):
        if output_path.exists():
            output_path.unlink()
        raise


async def generate_article(locale: str, slug: str, verbose: bool = True, sem: asyncio.Semaphore | None = None) -> int:
    """为文章生成对应语言的固定音色音频，返回生成数量"""
    async def _do():
        article_path = ARTICLES_DIR / locale / f"{slug}.mdx"
        if not article_path.exists():
            if verbose:
                print(f"  ❌ 文章不存在: {locale}/{slug}")
            return 0

        content = article_path.read_text(encoding="utf-8")
        text = strip_mdx(content)
        text = preprocess_for_tts(text)

        if not text:
            if verbose:
                print(f"  ❌ 内容为空: {locale}/{slug}")
            return 0

        voices = LANG_VOICES.get(locale, {})
        if not voices:
            return 0

        out_dir = AUDIO_DIR / slug
        out_dir.mkdir(parents=True, exist_ok=True)

        for key, voice in voices.items():
            out_path = out_dir / f"{key}.mp3"
            if out_path.exists():
                if verbose:
                    print(f"  ⏭  {locale}/{slug} 已有音频 ({key})")
                return 0

            if verbose:
                print(f"  🎙️  {locale}/{slug} ({len(text)} 字符) → {key}")

            try:
                await generate_audio(text, voice, out_path)
                return 1
            except Exception as e:
                print(f"    ❌ {key}: {e}")
                return 0

        return 0

    if sem:
        async with sem:
            return await _do()
    return await _do()


async def run_batch(tasks: list) -> int:
    """并发执行生成任务，总数累加"""
    results = await asyncio.gather(*tasks)
    return sum(results)


async def main():
    CONCURRENCY = 10  # 并发数，IO 密集型任务
    sem = asyncio.Semaphore(CONCURRENCY)
    total = 0

    if len(sys.argv) >= 3:
        locale, slug = sys.argv[1], sys.argv[2]
        print(f"🎯 生成: {locale}/{slug}")
        total = await generate_article(locale, slug)
    elif len(sys.argv) == 2:
        locale = sys.argv[1]
        locale_dir = ARTICLES_DIR / locale
        if not locale_dir.exists():
            print(f"❌ 语言目录不存在: {locale_dir}")
            sys.exit(1)
        slugs = sorted(p.stem for p in locale_dir.glob("*.mdx"))
        print(f"🎯 {locale}: {len(slugs)} 篇文章（并发 {CONCURRENCY}）")
        tasks = [generate_article(locale, s, sem=sem) for s in slugs]
        total = await run_batch(tasks)
    else:
        all_tasks = []
        for locale in sorted(LANG_VOICES.keys()):
            locale_dir = ARTICLES_DIR / locale
            if locale_dir.exists():
                slugs = sorted(p.stem for p in locale_dir.glob("*.mdx"))
                print(f"🎯 {locale}: {len(slugs)} 篇文章")
                all_tasks.extend([generate_article(locale, s, verbose=False, sem=sem) for s in slugs])
        print(f"⚡ 总计 {len(all_tasks)} 个任务，并发 {CONCURRENCY}")
        total = await run_batch(all_tasks)
        print(f"   ✅ 全部完成")

    if total > 0:
        print(f"\n✨ 共生成 {total} 个音频文件")
    else:
        print(f"\n✅ 所有音频均为最新，无需生成")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  已中断，不完整的文件已自动清理")
