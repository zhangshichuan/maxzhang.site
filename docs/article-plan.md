# 文章重写计划

Status: reset  
Last updated: 2026-11-27

> 2026-11-27：全部文章已删除，本文件保留为后续重写计划；下面的“中文初稿”状态是重置前的记录。

## 目标

把历史 28 组中英文文章重构为 **11 篇旗舰文章**，其余旧文按合并、降级或归档处理。旧文是素材库，不是必须逐篇复刻的模板。

读者优先级：

1. 招聘方与 AI 产品同行：判断作者如何定义问题、做取舍、验证结果。
2. 工程师：能拿走可运行的代码、架构判断和失败模式。
3. 中文技术读者：保留第一手语境；英文版按英文读者重写，不做逐句翻译。

核心原则：

- 一篇只回答一个决策问题。
- 开头是具体故障、场景或判断，不是“随着 XX 的发展”。
- 结构统一为：问题 → 真实案例 → 机制 → 取舍 → 失败模式 → 检查清单。
- 至少有一个可运行代码、图或表；引用官方文档并标明版本与验证日期。
- 中文先行，英文改编；AI 参与较多时设置 `aiAssisted: true`。
- 旗舰中文 8k–12k 字符，普通 4k–6k；英文 2.5k–4k words。

## 11 篇旗舰

| # | 新文章 | 来源 / 处理 | 核心问题 | 状态 |
| - | ------ | ----------- | -------- | ---- |
| 01 | RAG 的边界：幻觉、检索与评估 | 合并 `llm-hallucination-rag-guide` + `search-engine-vector-bm25-guide` | RAG 什么时候有用，什么时候只是把错误藏得更深？ | 中文初稿 |
| 02 | Agent 能力分层：Function Call → MCP → Skills / Subagent | 合并 `function-call-mcp-skills-subagent-guide` + `mcp-technical-details` | 这些能力层各自解决什么问题，边界在哪里？ | 中文初稿 |
| 03 | LLMOps：从 demo 到可运营 | 合并 `llmops-getting-started-guide` + `python-llmops-engineering-components` | 一个 LLM 功能上线后，靠什么持续稳定和降本？ | 中文初稿 |
| 04 | LangChain 该不该用：框架与直接调用的取舍 | 重写 `why-langchain-guide` | 什么时候需要框架，什么时候直接调 API 更清楚？ | planned |
| 05 | Agent runtime / Hermes：从 coding agent 到 living agent | 重写 `from-coding-agent-to-living-agent` | Agent 的长期记忆、工具和运行环境应该如何组织？ | planned |
| 06 | AI 时代的框架选型：约定、显式与可替换性 | 重写 `convention-vs-explicit-ai-era` | AI 生成代码普及后，框架的“约定”是资产还是负债？ | planned |
| 07 | 高并发系统架构：从故障现场到容量设计 | 重写 `high-concurrency-system-architecture-guide` | 系统为什么会挂，容量和降级应该怎么设计？ | planned |
| 08 | Node.js 内存泄露：从现象到根因 | 重写 `nodejs-memory-leak-mastery` | 如何从监控、堆快照和代码路径定位真实泄露？ | planned |
| 09 | TypeScript 工具链：谁在真正编译你的代码 | 重写 `typescript-toolchain-deep-dive` | 从 Webpack 到 Vite 到 Rust，工具链的分界线在哪里？ | planned |
| 10 | 前端架构：设计模式与性能判断 | 合并 `frontend-design-patterns-guide` + `frontend-data-structures-algorithms-guide` | 前端什么时候需要设计模式，什么时候只是过度抽象？ | planned |
| 11 | 可观测性：从监控到 OpenTelemetry，再到 AI 产品 | 合并 `opentelemetry-guide-part-1/2/3` + `apm-performance-monitoring-guide` | 监控回答“是否”，可观测性如何回答“为什么”？ | 中文初稿 |

## 后续批次 / 归档

第二批（有明确新角度再写）：

- `architecture-design-deep-dive`
- `production-middleware-ha-guide`
- `nodejs-logging-monitoring-guide`
- `nodejs-security-guide`
- `nodejs-unit-performance-testing-guide`
- `nextjs-jwt-auth-guide` + `prisma-zod-type-safety`（合并为一篇认证与类型安全）
- `go-language-quick-start-guide`
- `why-vue-doesnt-need-react-fiber`

归档或只保留索引：

- `apm-performance-monitoring-guide`：并入现有 OpenTelemetry 系列，不重复写。
- `nestjs-enterprise-practice-guide`
- `docker-k3d-frontend-guide`
- `tailwind-css-dark-mode-deep-dive`
- `python-web-scraping-reverse-engineering`

合并文章需要决定 URL 策略：保留一个旧 slug 作为 canonical，其余旧 slug 做重定向；不要直接删掉已有链接。

## Pilot：RAG 的边界

详细提纲与资料清单：`docs/article-plan/rag-boundary.md`

### 暂定主张

RAG 不是幻觉的解药，而是一套检索与评估工程。幻觉通常来自三类问题：模型没有所需知识、检索没有拿到正确证据、模型拿到了证据但不忠实。先建立评估闭环，再谈优化。

### 暂定结构

1. 一个真实失败：答案看起来很合理，但引用不存在或答非所问。
2. 幻觉的三种来源：知识缺失、检索错误、生成不忠实。
3. RAG 的四段管线：切分、索引、召回、重排与上下文组装。
4. 向量召回与 BM25 的分工：语义匹配 vs 精确匹配，为什么要 hybrid search。
5. 评估：retrieval recall、context precision、faithfulness、answer correctness；如何构造 golden set。
6. 常见失败模式：chunk 过大/过小、元数据缺失、固定 top-k、没有 rerank、上下文冲突、引用不忠。
7. 一个最小可运行方案或决策表。
8. 什么时候不该用 RAG：长上下文、工具调用、微调、直接拒答。

### 需要验证的资料

- RAG 原始论文与后续评测方法。
- BM25、embedding、rerank 的适用边界。
- 当前主流评测框架的指标定义，避免把不同指标混为一谈。
- 代码示例的实际运行环境与版本。

### 明确不写

- “什么是大模型”式科普开头。
- 泛泛的 prompt 技巧清单。
- 没有出处的效果数字。
- 把 RAG 描述成唯一解。

## 发布策略

写就是线上，不再区分草稿和已发布。

- 一篇文章开始写时，直接写入 `apps/web/articles/{locale}`；写完即上线。
- 保留原 `date` 作为首发时间，新增 `updated` 字段并在文章页展示。
- 合并文章时保留 canonical slug，旧 slug 做重定向。
- AI 参与实质性起草时设置 `aiAssisted: true`；仅用于资料检索和校对时不标。

## 完成标准

一篇算完成，需要同时满足：

- 中文终稿完成，英文改编完成。
- 事实、版本、代码可验证；代码能运行，不能运行的要明确标注伪代码。
- 至少一个图、表或可复现实验。
- 标题、summary、slug、redirect 处理完成。
- `pnpm lint:tsc` 与 `pnpm test` 通过。
- 没有模板化开头、空泛总结和重复段落。

## 节奏

RAG 与可观测性已完成中文初稿。剩余文章按 3 篇一批推进，每篇完成后更新本文件的 `状态`。
