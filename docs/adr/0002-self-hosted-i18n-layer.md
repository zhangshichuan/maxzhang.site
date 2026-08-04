# 自建轻量国际化层替代 next-intl

Status: accepted

next-intl 的 middleware、server API 与导航工具深度绑定 Next.js，而 TanStack Start 没有官方适配器。我们决定保留 URL 约定与 `messages/{locale}.json` 文件，自建一个薄 i18n 层：en 默认无前缀布局 + zh 带 `/zh` 前缀布局路由注入 locale + 轻量 locale 判断 + 客户端 `useTranslations`。

语言本身始终由 URL 决定（显式 `/zh` 链接保持中文）；无前缀（默认 en）路径由首屏内联脚本按本地偏好 `maxzhang.locale` 决定，无偏好时按浏览器语言判断（zh 开头跳 `/zh`，其余保持 en）。手动切换语言会写入该本地偏好。不引入 i18next 或第三方 TanStack 集成，因为站点文案简单且全站静态，重库只会增加适配成本。
