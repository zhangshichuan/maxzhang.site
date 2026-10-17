# 自建轻量国际化层替代 next-intl

Status: accepted

next-intl 的 middleware、server API 与导航工具深度绑定 Next.js，而 TanStack Start 没有官方适配器。我们决定保留 URL 约定与 `messages/{locale}.json` 文件，自建一个薄 i18n 层：en 默认无前缀布局 + zh 带 `/zh` 前缀布局路由注入 locale + 轻量 locale 判断 + 客户端 `useTranslations`。

语言完全由 URL 决定：无前缀路径固定为英文（默认语言），`/zh` 路径固定为中文；语言切换只改 URL，不写本地偏好，也不按浏览器语言自动跳转。这样默认入口、分享链接和搜索引擎抓取都稳定落在英文版。不引入 i18next 或第三方 TanStack 集成，因为站点文案简单且全站静态，重库只会增加适配成本。
