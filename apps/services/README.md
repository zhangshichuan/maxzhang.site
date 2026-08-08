# apps/services/ — 微服务目录

## 当前服务

- `tts/` — 流式语音合成服务（FastAPI + edge-tts，依赖用 uv 管理）
- `chat/` — 树洞聊天服务（Go 标准库，转发 DeepSeek，端口 9000）

## 约定

- 每个服务一个子目录，如 `tts/`、`chat/`
- 每个服务自带 `Dockerfile`，不共享构建逻辑
- 服务之间通过 HTTP/gRPC 通信，不共享数据库
- 根级 `docker-compose.yml` 统一编排
- Python 服务用 uv 管理依赖（pyproject.toml + uv.lock）；Go 服务只用标准库（go.mod，无第三方依赖）

## 服务模板

```text
apps/services/<name>/
├── Dockerfile
├── pyproject.toml   # Python 服务用 uv 管理依赖
├── uv.lock
└── app/
```
