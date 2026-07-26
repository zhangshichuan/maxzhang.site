# services/ — 未来微服务插槽

## 约定

- 每个服务一个子目录，如 `user-go/`、`crawl-python/`
- 每个服务自带 `Dockerfile`，不共享构建逻辑
- 服务之间通过 HTTP/gRPC 通信，不共享数据库
- 根级 `docker-compose.yml` 统一编排

## 服务模板

```
services/<name>/
├── Dockerfile
├── README.md
└── ...
```
