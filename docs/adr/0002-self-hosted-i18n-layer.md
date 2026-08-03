# 自建轻量国际化层替代 next-intl

Status: accepted

next-intl 的 middleware、server API 与导航工具深度绑定 Next.js，而 TanStack Start 没有官方适配器。我们决定保留现有 URL 约定（zh 默认无前缀、en 带 `/en` 前缀）与 `messages/{locale}.json` 文件，自建一个薄 i18n 层：`$locale` 路由参数 + 轻量 locale 判断 + 客户端 `useTranslations`。不引入 i18next 或第三方 TanStack 集成，因为站点文案简单且全站静态，重库只会增加适配成本。
