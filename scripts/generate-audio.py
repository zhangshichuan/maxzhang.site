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
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
ARTICLES_DIR = ROOT / "articles"
AUDIO_DIR = ROOT / "public" / "audio"

LANG_VOICES = {
    "zh": {
        "xiaoxiao": "zh-CN-XiaoxiaoNeural",   # 女声 - 温柔
        "yunxi": "zh-CN-YunxiNeural",         # 男声 - 阳光
        "yunjian": "zh-CN-YunjianNeural",     # 男声 - 激情
    },
    "en": {
        "jenny": "en-US-JennyNeural",         # 女声
        "guy": "en-US-GuyNeural",             # 男声
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
    text = re.sub(r"`[^`]+`", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"!\[.*?\]\([^)]+\)", "", text)
    text = re.sub(r"^[-*+]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\d+\.\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"---", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


async def generate_audio(text: str, voice: str, output_path: Path):
    """使用 edge-tts 生成语音文件"""
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate="+10%")
    await communicate.save(str(output_path))


async def generate_article(locale: str, slug: str, verbose: bool = True) -> int:
    """为文章随机选择一个音色生成音频，返回生成数量"""
    article_path = ARTICLES_DIR / locale / f"{slug}.mdx"
    if not article_path.exists():
        if verbose:
            print(f"  ❌ 文章不存在: {locale}/{slug}")
        return 0

    content = article_path.read_text(encoding="utf-8")
    text = strip_mdx(content)

    if not text:
        if verbose:
            print(f"  ❌ 内容为空: {locale}/{slug}")
        return 0

    voices = LANG_VOICES.get(locale, {})
    if not voices:
        return 0

    out_dir = AUDIO_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    # 检查是否已有任何音色文件
    existing = [k for k in voices if (out_dir / f"{k}.mp3").exists()]
    if existing:
        if verbose:
            print(f"  ⏭  {locale}/{slug} 已有音频 ({existing[0]})")
        return 0

    # 随机选一个音色
    key = random.choice(list(voices.keys()))
    voice = voices[key]

    if verbose:
        print(f"  📄 {locale}/{slug} ({len(text)} 字符) → {key}")

    try:
        await generate_audio(text, voice, out_dir / f"{key}.mp3")
        return 1
    except Exception as e:
        print(f"    ❌ {key}: {e}")
        return 0


async def main():
    total = 0

    if len(sys.argv) >= 3:
        # 单篇文章
        locale, slug = sys.argv[1], sys.argv[2]
        print(f"🎯 生成: {locale}/{slug}")
        total += await generate_article(locale, slug)
    elif len(sys.argv) == 2:
        # 指定语言全部
        locale = sys.argv[1]
        locale_dir = ARTICLES_DIR / locale
        if not locale_dir.exists():
            print(f"❌ 语言目录不存在: {locale_dir}")
            sys.exit(1)
        slugs = sorted(p.stem for p in locale_dir.glob("*.mdx"))
        print(f"🎯 {locale}: {len(slugs)} 篇文章")
        for s in slugs:
            total += await generate_article(locale, s)
    else:
        # 全部语言
        for locale in sorted(LANG_VOICES.keys()):
            locale_dir = ARTICLES_DIR / locale
            if locale_dir.exists():
                slugs = sorted(p.stem for p in locale_dir.glob("*.mdx"))
                print(f"🎯 {locale}: {len(slugs)} 篇文章")
                for s in slugs:
                    total += await generate_article(locale, s, verbose=False)
                print(f"   ✅ 完成 {locale}")

    if total > 0:
        print(f"\n✨ 共生成 {total} 个音频文件")
    else:
        print(f"\n✅ 所有音频均为最新，无需生成")


if __name__ == "__main__":
    asyncio.run(main())
