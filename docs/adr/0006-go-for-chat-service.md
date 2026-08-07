# 聊天服务采用 Go，作为仓库中第二个服务语言

Status: accepted

仓库既有微服务（tts）全部是 Python + uv 模板，但聊天服务定位为流式转发代理：接收 web 端完整消息历史，调用 DeepSeek，把 SSE 翻译后流回。用户明确选择 Go。Go 的并发模型与标准库（net/http、io）对这个场景非常顺手，单二进制部署也简单；代价是仓库服务层新增第二套语言与构建模板（go.mod + 多阶段 Dockerfile），本地开发需要安装 Go 工具链。

Considered Options:

- Python + FastAPI + uv：与现有服务一致、零新工具链，但用户选择 Go。
