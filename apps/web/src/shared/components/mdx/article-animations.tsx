'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

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

interface FlowAnimationProps {
  kicker: string
  title: string
  label: string
  caption: string
  stages: readonly string[]
}

export function ArticleFlow({ kicker, title, label, caption, stages }: FlowAnimationProps) {
  const reduceMotion = useReducedMotion()
  const count = stages.length
  const xs = stages.map((_, index) => 64 + (index * 592) / Math.max(count - 1, 1))
  const lastX = xs[xs.length - 1]

  return (
    <Scene className="rag-pipeline" kicker={kicker} title={title} label={label} caption={caption}>
      <svg className="rag-svg" viewBox="0 0 720 220" aria-hidden="true">
        <defs>
          <linearGradient id="article-flow-gradient" x1="0" x2="1">
            <stop offset="0" stopColor="var(--ni-mint)" />
            <stop offset="1" stopColor="var(--ni-amber)" />
          </linearGradient>
          <filter id="article-flow-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="article-flow-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--ni-line-2)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="720" height="220" fill="url(#article-flow-grid)" opacity="0.55" />
        <path d={`M64 110 H${lastX}`} fill="none" stroke="var(--ni-line)" strokeWidth="1" />
        <motion.path
          d={`M64 110 H${lastX}`}
          fill="none"
          stroke="url(#article-flow-gradient)"
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

        {stages.map((stage, index) => {
          const x = xs[index]
          return (
            <g key={`${stage}-${index}`}>
              <circle cx={x} cy="110" r="20" fill="var(--ni-panel)" stroke="var(--ni-line)" strokeWidth="1" />
              <circle
                className="rag-pipeline-halo"
                cx={x}
                cy="110"
                r="27"
                fill="none"
                stroke="var(--ni-mint)"
                strokeWidth="1"
                style={{ animationDelay: `${index * (8 / count)}s` }}
              />
              <circle
                className="rag-pipeline-core"
                cx={x}
                cy="110"
                r="4"
                fill="var(--ni-muted-2)"
                style={{ animationDelay: `${index * (8 / count)}s` }}
              />
              <text x={x} y="72" textAnchor="middle" className="rag-svg-index">
                {String(index + 1).padStart(2, '0')}
              </text>
              <text x={x} y="160" textAnchor="middle" className="rag-svg-label">
                {stage}
              </text>
            </g>
          )
        })}

        <motion.circle
          cx={xs[0]}
          cy="110"
          r="6"
          fill="var(--ni-mint)"
          filter="url(#article-flow-glow)"
          animate={
            reduceMotion
              ? { cx: lastX, opacity: 1 }
              : { cx: xs, opacity: xs.map((_, index) => (index === count - 1 ? 0 : 1)) }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 8,
                  times: xs.map((_, index) => (index / Math.max(count - 1, 1)) * 0.8),
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
      </svg>
    </Scene>
  )
}

interface LayersAnimationProps {
  kicker: string
  title: string
  label: string
  caption: string
  layers: readonly string[]
}

export function ArticleLayers({ kicker, title, label, caption, layers }: LayersAnimationProps) {
  const reduceMotion = useReducedMotion()
  const count = layers.length
  const top = 56
  const bottom = 244
  const gap = (bottom - top) / Math.max(count - 1, 1)
  const ys = layers.map((_, index) => top + index * gap)

  return (
    <Scene className="art-layers" kicker={kicker} title={title} label={label} caption={caption}>
      <svg className="rag-svg" viewBox="0 0 720 300" aria-hidden="true">
        <defs>
          <pattern id="article-layers-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--ni-line-2)" strokeWidth="1" />
          </pattern>
          <filter id="article-layers-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="720" height="300" fill="url(#article-layers-grid)" opacity="0.5" />
        <line x1="110" y1={ys[0]} x2="110" y2={ys[count - 1]} stroke="var(--ni-line)" strokeWidth="1" />

        {layers.map((layer, index) => (
          <g key={`${layer}-${index}`}>
            <rect
              className="art-layer"
              x="150"
              y={ys[index] - 17}
              width="420"
              height="34"
              fill="var(--ni-bg)"
              stroke="var(--ni-line)"
              style={{ animationDelay: `${index * (6 / count)}s` }}
            />
            <text x="170" y={ys[index] + 4} className="rag-svg-label">
              {layer}
            </text>
            <text x="552" y={ys[index] + 4} textAnchor="end" className="rag-svg-index">
              {String(index + 1).padStart(2, '0')}
            </text>
          </g>
        ))}

        <motion.circle
          cx="110"
          cy={ys[0]}
          r="6"
          fill="var(--ni-mint)"
          filter="url(#article-layers-glow)"
          animate={reduceMotion ? { cy: ys[count - 1], opacity: 1 } : { cy: ys, opacity: [1, 1, 1, 1, 0] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 6,
                  times: ys.map((_, index) => (index / Math.max(count - 1, 1)) * 0.8),
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
        <text x="110" y="286" textAnchor="middle" className="rag-svg-index">
          SIGNAL
        </text>
      </svg>
    </Scene>
  )
}

interface LoopAnimationProps {
  kicker: string
  title: string
  label: string
  caption: string
  nodes: readonly string[]
}

export function ArticleLoop({ kicker, title, label, caption, nodes }: LoopAnimationProps) {
  const reduceMotion = useReducedMotion()
  const count = nodes.length
  const positions = nodes.map((_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count
    return {
      x: 360 + 130 * Math.cos(angle),
      y: 210 + 130 * Math.sin(angle),
    }
  })

  return (
    <Scene className="rag-evaluation" kicker={kicker} title={title} label={label} caption={caption}>
      <svg className="rag-svg" viewBox="0 0 720 420" aria-hidden="true">
        <defs>
          <radialGradient id="article-loop-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="var(--ni-mint)" stopOpacity="0.12" />
            <stop offset="1" stopColor="var(--ni-mint)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="article-loop-comet" x1="0" x2="1">
            <stop offset="0" stopColor="var(--ni-mint)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--ni-mint)" stopOpacity="1" />
          </linearGradient>
          <filter id="article-loop-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="360" cy="210" r="130" fill="url(#article-loop-core)" />
        <circle cx="360" cy="210" r="130" fill="none" stroke="var(--ni-line)" strokeDasharray="3 9" />

        <g className={reduceMotion ? 'rag-loop-orbit is-static' : 'rag-loop-orbit'}>
          <path
            d="M315 88 A130 130 0 0 1 405 88"
            fill="none"
            stroke="url(#article-loop-comet)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="360" cy="80" r="6" fill="var(--ni-mint)" filter="url(#article-loop-glow)" />
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

        {nodes.map((node, index) => {
          const position = positions[index]
          return (
            <g
              key={`${node}-${index}`}
              className={reduceMotion ? 'rag-loop-svg-node is-static' : 'rag-loop-svg-node'}
              style={{ animationDelay: `${index * (14 / count)}s` }}
            >
              <rect
                x={position.x - 40}
                y={position.y - 14}
                width="80"
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
            {title}
          </text>
          <text x="360" y="224" textAnchor="middle" className="rag-svg-note">
            持续反馈
          </text>
        </g>
      </svg>
    </Scene>
  )
}

const signalLanes = [
  { id: 'logs', label: '日志', color: 'var(--ni-amber)', points: [130, 70, 70] },
  { id: 'metrics', label: '指标', color: 'var(--ni-mint)', points: [130, 130, 130] },
  { id: 'traces', label: '链路', color: 'var(--ni-ink)', points: [130, 190, 190] },
] as const

export function SignalFusionAnimation() {
  const reduceMotion = useReducedMotion()

  return (
    <Scene
      className="obs-signals"
      kicker="Fig. 01 / Three signals"
      title="三类信号，一条因果链"
      label="日志、指标、链路三类信号从同一个请求出发，最终通过 traceId 关联起来。"
      caption="日志给细节，指标给全景，链路给因果。三类数据分开看都有盲区，靠同一个上下文才能拼回一次故障。"
    >
      <svg className="rag-svg" viewBox="0 0 720 260" aria-hidden="true">
        <defs>
          <pattern id="obs-signal-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--ni-line-2)" strokeWidth="1" />
          </pattern>
          <filter id="obs-signal-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="720" height="260" fill="url(#obs-signal-grid)" opacity="0.5" />

        {signalLanes.map((lane, laneIndex) => {
          const [startY, midY, endY] = lane.points
          return (
            <g key={lane.id}>
              <path d={`M60 ${startY} L260 ${midY} L560 ${endY}`} fill="none" stroke="var(--ni-line)" strokeWidth="1" />
              <text x="44" y={midY + 4} textAnchor="end" className="rag-svg-index">
                {lane.label}
              </text>
              <motion.circle
                cx="60"
                cy={startY}
                r="5"
                fill={lane.color}
                filter="url(#obs-signal-glow)"
                animate={
                  reduceMotion
                    ? { cx: 560, cy: endY, opacity: 0.8 }
                    : { cx: [60, 260, 560], cy: [startY, midY, endY], opacity: [0, 1, 1, 0] }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 4,
                        times: [0, 0.35, 0.75, 1],
                        repeat: Infinity,
                        delay: laneIndex * 0.5,
                        ease: 'easeInOut',
                      }
                }
              />
            </g>
          )
        })}

        <motion.path
          d="M560 58 V202"
          fill="none"
          stroke="var(--ni-mint)"
          strokeWidth="1"
          animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.2, 0.9, 0.2] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <text x="582" y="126" className="rag-svg-core">
          traceId
        </text>
        <text x="582" y="144" className="rag-svg-note">
          把碎片接起来
        </text>

        <circle cx="60" cy="130" r="7" fill="var(--ni-mint)" filter="url(#obs-signal-glow)" />
        <text x="60" y="238" textAnchor="middle" className="rag-svg-index">
          REQUEST
        </text>
      </svg>
    </Scene>
  )
}
