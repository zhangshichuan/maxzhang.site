# 摄影存储首个后端：服务器本地磁盘（七牛延后）

摄影存储 v1 使用 `StorageProvider` 的 local 适配器，把展示副本写到服务器本地卷（`photos_data`），由 Web 同源代理输出。原因是国内对象存储/CDN 的自定义域名普遍要求 ICP 备案，而站主当前无法备案；本地磁盘零备案、零额外成本，且本来就在现有服务器上。

Status: accepted

## Considered Options

- **七牛 Kodo**：价格与国内体验俱佳，但大陆 CDN 需要已备案域名，暂不可行；适配器已实现，备案就绪后可切换。
- **Cloudflare R2 / Backblaze B2**：总价更低，但大陆直连不稳定，且 B2 注册需外币卡。
- **GitHub 私有仓库**：适合做离线备份，但不能作为公开伺服源（raw 只对公开仓库开放），且仓库体积有硬上限。

## Consequences

- 展示副本持久化在 `photos_data` 卷，删除作品时同步删除文件；原图不落服务器，本地仍为唯一真源。
- 切换七牛等厂商时只需改 `STORAGE_PROVIDER` 并新增适配器（已具备），DB 里的 URL 由存储客户端按需映射。
