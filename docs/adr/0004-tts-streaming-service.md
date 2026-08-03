# 语音播报改为实时 TTS 服务

Status: accepted

仓库中的 54 个预生成 MP3（约 750MB）使仓库臃肿，且文章更新后需要手动重新生成。我们决定删除这些文件并重写 git 历史，新增 `apps/services/tts`（Python + FastAPI + edge-tts，依赖用 uv 管理）按需生成音频：Web 端从 MDX 提取纯文本，TTS 服务分片流式返回 MP3；以内容哈希作为缓存键实现自动失效，运行时缓存支持 Range 请求并自动清理。播放器现有交互（进度、跳转、倍速）保留，缓存只存运行期 volume，不进入仓库。
