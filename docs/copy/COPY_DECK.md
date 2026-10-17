# 文案体系（重构版）

> 本文是站点文案的唯一策略文档；具体字符串以 `apps/web/messages/{zh,en}.json` 为准。
> 文章正文不在此文档范围内。

## 1. 定位

**一句话**：把模型能力，翻译成人们愿意用的产品。

**电梯陈述**：十年全栈工程师，过去两年把多智能体系统从 0 带到生产；现在转向 AI 产品经理，擅长把模糊的 AI 能力定义成可验证、可交付的产品。

**面向谁**：

- 主要：正在招 AI 产品经理的团队（国内为主，兼顾远程/国际化）。
- 次要：AI 产品同行、技术读者、摄影与个人内容访客。

**希望对方记住的三件事**：

1. 有产品判断，不是只会讲技术。
2. 能自己搭原型、能和工程聊到底，方案可落地。
3. 做过真实的 AI 产品落地（多智能体、AI Native 流程、降本结果）。

## 2. 叙事结构

### 首页（从「观点」到「证据」再到「行动」）

1. **Hero**：定位 + 状态
2. **产品主张**：三条判断（先定义任务 / 评估不是跑分 / 工程背景是取舍）
3. **一个例子**：广告素材生产的 Agent 工作流（场景 → 判断 → 结果）
4. **工作方式**：定义问题 → 做原型 → 设计评估 → 推进交付
5. **工程底子**：一行可验证的技术背景
6. **精选文章**：工程手记与 AI 产品思考
7. **Now + 联系**：正在做什么、在找什么、怎么联系

### 关于页（从「我是谁」到「我做过什么」再到「我在找什么」）

1. 定位与状态（Open to AI PM roles）
2. 三段自我介绍：现在 / 为什么转 / 在找什么
3. 产品主张（与首页共用 `Theses`）
4. 三个产品故事（场景 / 判断 / 动作 / 结果）
5. 我在找什么（方向 / 阶段 / 地点）
6. 工作经历（精简时间线，细节让位给产品故事）
7. 工程底子 / 研习方向 / 教育 / 兴趣
8. 联系 CTA

### 其他页面

- **文章**：工程手记为现状，AI 产品笔记在筹备；不承诺不存在的内容。
- **摄影**：个人审美与生活面，语气放松但不随意。
- **树洞**：明确是「一个 AI 倾听实验」，讲清边界与隐私，不包装成心理服务。
- **404**：保留一点产品经理式幽默，但提供明确出口。

## 3. 语气与写作规则

**中文**

- 短句、动词开头、具体；能删的形容词都删。
- 用产品语言：边界、取舍、评估、兜底、成本、交付、验证。
- 少用工程师黑话（上游、指纹、实例）；必须出现时先解释。
- 禁用/慎用：赋能、抓手、闭环（非必要不用）、颠覆、革命、最强。
- 不虚构经历、数字、客户；可验证的结果才写数字。

**English**

- Active voice, sentence case, short sentences.
- Plain product English; avoid hype words (revolutionary, game-changing).
- Mirror the Chinese meaning, not word-for-word.

**双语规则**

- 结构与信息量一致，表达各自地道。
- 专有名词统一：AI 产品经理 / AI Product Manager；树洞 / Tree Hole；工程手记 / Engineering Notes。
- 按钮动词开头：阅读文章 / 发邮件 / 查看源码。

**微文案**

- 错误：说明发生了什么 + 下一步动作，不解释内部实现。
- 空状态：说明现状 + 邀请动作，不用「敬请期待」堆砌。
- 隐私/安全：给出可验证的承诺（本地存储、开源代码）。

## 4. 关键文案（落点）

| 模块 | 中文 | English |
| --- | --- | --- |
| Hero headline | 把模型能力，翻译成人们愿意用的产品。 | Making AI products people actually use. |
| Hero lede | 十年全栈工程师，过去两年把多智能体系统从 0 带到生产…… | Ten years as a full-stack engineer; in the last two I took a multi-agent system from zero to production… |
| 状态 | 正在寻找 AI 产品岗位 · 成都 / 远程 | Open to AI PM roles · Chengdu / Remote |
| 三个主张 | 先定义任务，再谈模型 / 评估不是跑分 / 工程背景的价值是取舍 | Define the task before the model / Evaluation is not a benchmark / Engineering depth is about trade-offs |
| 一个例子 | 把广告素材生产，拆成一条 Agent 工作流 | Turning ad asset production into an agent workflow |
| 工作方式 | 定义问题 → 做原型 → 设计评估 → 推进交付 | Define → Prototype → Evaluate → Deliver |
| 联系 CTA | 在找 AI 产品岗位。 | Looking for an AI product role. |
| 树洞定位 | 一个 AI 倾听实验 | An AI listening experiment |
| 摄影副标题 | 业余拍照，认真挑片。 | Amateur photography, carefully curated. |
| 404 | 这条路径暂时没有产品需求。回到首页重新出发？ | This path doesn't have a product requirement yet. Head back home? |

## 5. 信息架构与实现

- 共享文案命名空间：`Theses`（首页 / 关于共用）。
- 首页区块：`HomePage.hero / case / method / background / featuredPosts / now / contact`。
- 关于页区块：`AboutPage.intro / stories / lookingFor / timeline / techStack / learning / education / interests / contact*`。
- 文章页：`PostsPage.title / description / note`。
- 树洞：`Chat.subtitle / emptyState / privacyNote / errors`。
- SEO：各 locale route 的 `head.meta` 与页面文案保持一致，首页/关于/文章/摄影/搜索/树洞均有 description。

## 6. 维护规则

1. 新增文案先写进本文档的定位/语气判断，再落到 `messages/*.json`，不要在组件里硬编码中文。
2. 任何数字、客户、结果必须可验证；没有证据就写成「正在做/在整理」。
3. 新增 AI 产品内容后，可把首页 CTA 从「阅读文章」升级为「产品笔记」，并替换 About 的「AI 产品练习」入口。
4. 每次改版后同步更新本文件末尾的变更记录。

## 7. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-10-18 | 文案体系重构：确立「能把模型能力翻译成产品」定位，新增产品主张 / 一个例子 / 工作方式 / 联系 CTA，重构关于页为产品故事结构，重写全站 SEO 与微文案 |
