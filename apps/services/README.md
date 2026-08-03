# apps/services/ — 微服务目录

## 当前服务

- `tts/` — 流式语音合成服务（FastAPI + edge-tts，依赖用 uv 管理）

## 约定

- 每个服务一个子目录，如 `tts/`
- 每个服务自带 `Dockerfile`，不共享构建逻辑
- 服务之间通过 HTTP/gRPC 通信，不共享数据库
- 根级 `docker-compose.yml` 统一编排

## 服务模板

```text
apps/services/<name>/
├── Dockerfile
├── pyproject.toml   # Python 服务用 uv 管理依赖
├── uv.lock
└── app/
```
