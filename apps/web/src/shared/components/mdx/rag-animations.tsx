'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * RAG 文章的动画场景。
 *
 * 三个场景都使用内联 SVG + CSS/Framer Motion：
 * - 证据管线：光点沿路径穿过六个站点
 * - 三类失败：信号在断点处停下并闪红
 * - 评估闭环：彗星沿轨道运行，节点依次点亮
 *
 * 动画只在进入视口时启动，并尊重 prefers-reduced-motion。
 */

const pipelineStations = ['问题', '检索', '重排', '上下文', '生成', '引用 / 拒答'] as const

const failureModes = [
  {
    id: 'knowledge',
    title: '知识缺失',
    stages: ['问题', '知识库', '模型补写'],
    broken: 1,
    note: ['库里没有答案', '模型把缺失部分补上'],
  },
  {
    id: 'retrieval',
    title: '检索失败',
    stages: ['问题', '检索', '证据'],
    broken: 1,
    note: ['证据在库里', '却没有进入候选集'],
  },
  {
    id: 'faithfulness',
    title: '生成不忠实',
    stages: ['证据', '模型', '回答'],
    broken: 2,
    note: ['证据在上下文里', '回答却越界'],
  },
] as const

const loopNodes = ['检索', '上下文', '生成', '评估'] as const
const loopPositions = [
  { x: 360, y: 80 },
  { x: 490, y: 210 },
  { x: 360, y: 340 },
  { x: 230, y: 210 },
] as const

interface SceneProps {
  className: string
  kicker: string
  title: string
  label: string
  caption: string
  children: ReactNode
}

function Scene({ className, kicker, title, label, caption, children }: SceneProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.figure
      className={`rag-anim ${className}`}
      role="img"
      aria-label={label}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="rag-anim-head">
        <span className="rag-anim-kicker">{kicker}</span>
        <span className="rag-anim-title">{title}</span>
      </div>
      {children}
      <figcaption>{caption}</figcaption>
    </motion.figure>
  )
}

export function RagPipelineAnimation() {
  const reduceMotion = useReducedMotion()
  const xs = [64, 182, 301, 419, 538, 656]

  return (
    <Scene
      className="rag-pipeline"
      kicker="Fig. 01 / Evidence path"
      title="证据如何穿过 RAG 管线"
      label="RAG 证据管线动画：光点从问题出发，依次穿过检索、重排、上下文、生成和引用或拒答六个站点。"
      caption="证据在每一段都可能丢失。光点跑得再顺，也不代表证据真的到了；真正要盯的是每个站点的输入和输出。"
    >
      <svg className="rag-svg" viewBox="0 0 720 220" aria-hidden="true">
        <defs>
          <linearGradient id="rag-pipeline-gradient" x1="0" x2="1">
            <stop offset="0" stopColor="var(--ni-mint)" />
            <stop offset="1" stopColor="var(--ni-amber)" />
          </linearGradient>
          <filter id="rag-pipeline-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="rag-pipeline-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--ni-line-2)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="720" height="220" fill="url(#rag-pipeline-grid)" opacity="0.55" />
        <path d="M64 110 H656" fill="none" stroke="var(--ni-line)" strokeWidth="1" />
        <motion.path
          d="M64 110 H656"
          fill="none"
          stroke="url(#rag-pipeline-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={reduceMotion ? { pathLength: 1 } : { pathLength: [0, 1, 1, 0] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 8, times: [0, 0.72, 0.9, 1], repeat: Infinity, ease: 'easeInOut' }
          }
        />

        {pipelineStations.map((station, index) => {
          const x = xs[index]
          return (
            <g key={station}>
              <circle cx={x} cy="110" r="20" fill="var(--ni-panel)" stroke="var(--ni-line)" strokeWidth="1" />
              <circle
                className="rag-pipeline-halo"
                cx={x}
                cy="110"
                r="27"
                fill="none"
                stroke="var(--ni-mint)"
                strokeWidth="1"
                style={{ animationDelay: `${index * 1.1}s` }}
              />
              <circle
                className="rag-pipeline-core"
                cx={x}
                cy="110"
                r="4"
                fill="var(--ni-muted-2)"
                style={{ animationDelay: `${index * 1.1}s` }}
              />
              <text x={x} y="72" textAnchor="middle" className="rag-svg-index">
                0{index + 1}
              </text>
              <text x={x} y="160" textAnchor="middle" className="rag-svg-label">
                {station}
              </text>
            </g>
          )
        })}

        <motion.circle
          cx={xs[0]}
          cy="110"
          r="6"
          fill="var(--ni-mint)"
          filter="url(#rag-pipeline-glow)"
          animate={reduceMotion ? { cx: xs[xs.length - 1], opacity: 1 } : { cx: xs, opacity: [1, 1, 1, 1, 1, 0] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 8, times: [0, 0.16, 0.32, 0.48, 0.64, 0.8], repeat: Infinity, ease: 'easeInOut' }
          }
        />
      </svg>
    </Scene>
  )
}

function FailureDiagram({
  failure,
  index,
  reduceMotion,
}: {
  failure: (typeof failureModes)[number]
  index: number
  reduceMotion: boolean | null
}) {
  const nodeYs = [52, 110, 168]
  const brokenY = nodeYs[failure.broken]
  const delay = index * 1
  const timing = { duration: 4.2, times: [0, 0.5, 0.8, 1], repeat: Infinity, repeatDelay: 0.8, delay }

  return (
    <svg className="rag-failure-svg" viewBox="0 0 220 220" aria-hidden="true">
      <rect x="0.5" y="0.5" width="219" height="219" fill="none" stroke="var(--ni-line)" />
      <line x1="110" y1={nodeYs[0]} x2="110" y2={nodeYs[2]} stroke="var(--ni-line)" strokeWidth="1" />

      {failure.stages.map((stage, stageIndex) => {
        const y = nodeYs[stageIndex]
        const broken = stageIndex === failure.broken
        return (
          <g key={stage}>
            <rect
              x="35"
              y={y - 15}
              width="150"
              height="30"
              fill="var(--ni-bg)"
              stroke={broken ? 'var(--ni-red)' : 'var(--ni-line)'}
              strokeWidth="1"
            />
            <text x="110" y={y + 4} textAnchor="middle" className={broken ? 'rag-svg-node is-broken' : 'rag-svg-node'}>
              {stage}
            </text>
          </g>
        )
      })}

      {!reduceMotion && (
        <>
          <motion.rect
            x="0.5"
            y="0.5"
            width="219"
            height="219"
            fill="none"
            stroke="var(--ni-red)"
            strokeWidth="1"
            animate={{ opacity: [0, 0, 0.8, 0] }}
            transition={{ ...timing, times: [0, 0.5, 0.6, 0.88] }}
          />
          <motion.circle
            cx="110"
            cy="22"
            r="5"
            style={{ filter: 'drop-shadow(0 0 6px var(--ni-mint))' }}
            animate={{
              cy: [22, brokenY, brokenY, brokenY],
              opacity: [0, 1, 1, 0],
              fill: ['var(--ni-mint)', 'var(--ni-mint)', 'var(--ni-red)', 'var(--ni-red)'],
            }}
            transition={timing}
          />
          <motion.circle
            cx="110"
            cy={brokenY}
            r="10"
            fill="var(--ni-red)"
            style={{ filter: 'drop-shadow(0 0 12px var(--ni-red))' }}
            animate={{ r: [10, 10, 24, 32], opacity: [0, 0, 0.22, 0] }}
            transition={{ ...timing, times: [0, 0.5, 0.6, 0.9] }}
          />
          <motion.circle
            cx="110"
            cy={brokenY}
            r="0"
            fill="none"
            stroke="var(--ni-red)"
            strokeWidth="1"
            animate={{ r: [0, 0, 22, 34], opacity: [0, 0, 0.8, 0] }}
            transition={{ ...timing, times: [0, 0.5, 0.6, 0.9] }}
          />
          <motion.g animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ ...timing, times: [0, 0.5, 0.56, 0.78, 0.9] }}>
            <path
              d={`M${110 - 8} ${brokenY - 8} L${110 + 8} ${brokenY + 8} M${110 + 8} ${brokenY - 8} L${110 - 8} ${brokenY + 8}`}
              stroke="var(--ni-red)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <text x="110" y={brokenY - 26} textAnchor="middle" className="rag-svg-break-label">
              断点
            </text>
          </motion.g>
        </>
      )}

      {reduceMotion && (
        <>
          <path
            d={`M${110 - 8} ${brokenY - 8} L${110 + 8} ${brokenY + 8} M${110 + 8} ${brokenY - 8} L${110 - 8} ${brokenY + 8}`}
            stroke="var(--ni-red)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text x="110" y={brokenY - 26} textAnchor="middle" className="rag-svg-break-label">
            断点
          </text>
        </>
      )}
    </svg>
  )
}

export function RagFailureModesAnimation() {
  const reduceMotion = useReducedMotion()

  return (
    <Scene
      className="rag-failures"
      kicker="Fig. 02 / Failure modes"
      title="信号在哪一段断掉"
      label="三种 RAG 失败动画：知识缺失时信号停在知识库，检索失败时停在召回，生成不忠实时停在回答。"
      caption="三类失败对应三种修法：补证据、修召回、约束生成。先给失败样本打标签，再决定改哪一层。"
    >
      <div className="rag-failure-grid">
        {failureModes.map((failure, index) => (
          <div className="rag-failure-card" key={failure.id}>
            <span className="rag-failure-card-title">{failure.title}</span>
            <FailureDiagram failure={failure} index={index} reduceMotion={reduceMotion} />
            <p className="rag-failure-card-note">{failure.note.join(' ')}</p>
          </div>
        ))}
      </div>
    </Scene>
  )
}

export function RagEvaluationLoopAnimation() {
  const reduceMotion = useReducedMotion()

  return (
    <Scene
      className="rag-evaluation"
      kicker="Fig. 03 / Evaluation loop"
      title="评估不是最后一步"
      label="RAG 评估闭环动画：彗星沿轨道依次经过检索、上下文、生成、评估，评估结果回流到检索。"
      caption="评估应该把失败样本送回检索和上下文组装。只做一次上线前评测，系统不会自己变好。"
    >
      <svg className="rag-svg" viewBox="0 0 720 420" aria-hidden="true">
        <defs>
          <radialGradient id="rag-loop-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="var(--ni-mint)" stopOpacity="0.12" />
            <stop offset="1" stopColor="var(--ni-mint)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rag-loop-comet" x1="0" x2="1">
            <stop offset="0" stopColor="var(--ni-mint)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--ni-mint)" stopOpacity="1" />
          </linearGradient>
          <filter id="rag-loop-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="360" cy="210" r="130" fill="url(#rag-loop-core)" />
        <circle cx="360" cy="210" r="130" fill="none" stroke="var(--ni-line)" strokeDasharray="3 9" />

        <g className={reduceMotion ? 'rag-loop-orbit is-static' : 'rag-loop-orbit'}>
          <path
            d="M315 88 A130 130 0 0 1 405 88"
            fill="none"
            stroke="url(#rag-loop-comet)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="360" cy="80" r="6" fill="var(--ni-mint)" filter="url(#rag-loop-glow)" />
        </g>

        <g
          className={
            reduceMotion ? 'rag-loop-orbit rag-loop-orbit--reverse is-static' : 'rag-loop-orbit rag-loop-orbit--reverse'
          }
        >
          <circle cx="360" cy="210" r="86" fill="none" stroke="var(--ni-line-2)" strokeDasharray="2 10" />
          <circle
            cx="360"
            cy="124"
            r="3"
            fill="var(--ni-amber)"
            style={{ filter: 'drop-shadow(0 0 6px var(--ni-amber))' }}
          />
        </g>

        {loopNodes.map((node, index) => {
          const position = loopPositions[index]
          return (
            <g
              key={node}
              className={reduceMotion ? 'rag-loop-svg-node is-static' : 'rag-loop-svg-node'}
              style={{ animationDelay: `${index * 3.5}s` }}
            >
              <rect
                x={position.x - 36}
                y={position.y - 14}
                width="72"
                height="28"
                fill="var(--ni-panel)"
                stroke="var(--ni-line)"
              />
              <text x={position.x} y={position.y + 4} textAnchor="middle" className="rag-svg-label">
                {node}
              </text>
            </g>
          )
        })}

        <g className="rag-loop-core">
          <text x="360" y="204" textAnchor="middle" className="rag-svg-core">
            评估闭环
          </text>
          <text x="360" y="224" textAnchor="middle" className="rag-svg-note">
            失败样本回流
          </text>
        </g>
      </svg>
    </Scene>
  )
}
