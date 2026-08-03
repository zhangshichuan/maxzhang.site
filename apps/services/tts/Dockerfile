FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONUNBUFFERED=1
ENV TTS_CACHE_DIR=/data/tts
# 容器内直连 PyPI 慢，走清华镜像
ENV UV_DEFAULT_INDEX="https://pypi.tuna.tsinghua.edu.cn/simple"

WORKDIR /app

# 依赖由 uv 管理（pyproject.toml + uv.lock）
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY app ./app

ENV PATH="/app/.venv/bin:$PATH"

RUN mkdir -p /data/tts

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
