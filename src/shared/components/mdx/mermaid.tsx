/**
 * Mermaid图表组件
 *
 * 渲染Mermaid流程图、时序图等图表，支持主题适配、全屏预览和缩放功能
 * 包含灯箱模式，用户可点击图表放大查看细节
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'
import mermaid from 'mermaid'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/** Mermaid组件属性接口 */
interface MermaidProps {
  chart: string // Mermaid图表定义代码
}

/**
 * Mermaid图表主组件
 *
 * 渲染Mermaid图表，支持主题适配、错误处理和交互功能
 *
 * @param chart - Mermaid图表定义代码
 * @returns 渲染图表元素，包含缩略图和全屏灯箱
 */
export default function Mermaid({ chart }: MermaidProps) {
  // 国际化翻译
  const t = useTranslations('Mermaid')
  // 当前主题（明/暗）
  const { resolvedTheme } = useTheme()
  // 渲染后的SVG内容
  const [svg, setSvg] = useState<string>('')
  // 渲染错误信息
  const [error, setError] = useState<string | null>(null)
  // 灯箱（全屏模式）是否打开
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  // 缩放比例
  const [zoom, setZoom] = useState(1)

  // 初始化Mermaid并渲染图表，依赖图表代码和主题变化
  useEffect(() => {
    const isDark = resolvedTheme === 'dark'

    // 配置Mermaid初始化参数
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'var(--font-sans)',
      themeVariables: {
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
      },
      flowchart: {
        htmlLabels: true,
        useMaxWidth: true,
        padding: 30,
      },
    })

    const renderChart = async () => {
      if (chart) {
        try {
          const id = `m${Math.random().toString(36).substring(2, 11)}`
          const { svg: renderedSvg } = await mermaid.render(id, chart)

          // 关键修复：不再强制替换为 100%，而是移除 Mermaid 可能注入的冲突 style
          // 保留原始的 width/height 属性，让 SVG 拥有原始比例
          const cleanedSvg = renderedSvg.replace(/style="max-width:.*?"/, '')

          setSvg(cleanedSvg)
          setError(null)
        } catch (err) {
          console.error('Mermaid render error:', err)
          setError('Failed to render diagram')
        }
      }
    }

    renderChart()
  }, [chart, resolvedTheme])

  /**
   * 切换全屏灯箱显示
   * 打开时禁用页面滚动，关闭时恢复滚动并重置缩放
   */
  const toggleLightbox = () => {
    if (!isLightboxOpen) {
      setIsLightboxOpen(true)
      document.body.style.overflow = 'hidden'
    } else {
      setIsLightboxOpen(false)
      setZoom(1)
      document.body.style.overflow = 'unset'
    }
  }

  /**
   * 放大图表
   * @param e - 鼠标事件，阻止事件冒泡
   */
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((prev) => Math.min(prev + 0.2, 4))
  }

  /**
   * 缩小图表
   * @param e - 鼠标事件，阻止事件冒泡
   */
  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((prev) => Math.max(prev - 0.2, 0.3))
  }

  /**
   * 重置缩放比例到原始大小
   * @param e - 鼠标事件，阻止事件冒泡
   */
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom(1)
  }

  /**
   * 处理鼠标滚轮缩放
   * 仅在灯箱打开时生效，向上滚动放大，向下滚动缩小
   * @param e - 滚轮事件
   */
  const handleWheel = (e: React.WheelEvent) => {
    // 只有在灯箱打开时才处理滚动缩放
    if (isLightboxOpen) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.3), 4))
    }
  }

  if (error) {
    return (
      <div
        className="
    my-4 rounded-sm border border-red-500 p-4 text-sm text-red-500
  "
      >
        {error}
      </div>
    )
  }

  return (
    <>
      {/* 缩略图模式：利用原始比例进行缩放 */}
      <div className="group relative my-12 cursor-zoom-in">
        <div
          onClick={toggleLightbox}
          className="
       not-prose bg-card flex max-h-150 w-full items-center justify-center
       overflow-hidden rounded-2xl border border-border p-6 shadow-sm
       transition-all
       hover:ring-4 hover:ring-primary/10
       md:p-10
     "
        >
          <div
            className="
        flex h-full w-full items-center justify-center
        [&>svg]:size-auto [&>svg]:max-h-135 [&>svg]:max-w-full
        [&>svg]:object-contain
      "
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>

        <div
          className="
      pointer-events-none absolute top-4 right-4 flex items-center gap-2
      rounded-full border border-border bg-background/60 px-3 py-1.5 opacity-0
      shadow-sm backdrop-blur-md transition-all duration-300
      group-hover:opacity-100
    "
        >
          <Maximize2 className="h-3.5 w-3.5 text-primary" />
          <span
            className="
       text-[10px] font-black tracking-tight text-foreground uppercase
     "
          >
            {t('clickToZoom')} {/* Mermaid/clickToZoom 点击查看高清大图 */}
          </span>
        </div>
      </div>

      {/* 全屏高清灯箱 */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onWheel={handleWheel}
            className="
        fixed inset-0 z-100 flex items-center justify-center bg-background/98
        backdrop-blur-xl
      "
          >
            <button
              onClick={toggleLightbox}
              className="
         bg-card group absolute top-6 left-6 z-110 rounded-xl border-2
         border-border p-3 shadow-xl transition-all
         hover:bg-muted
       "
            >
              <X
                className="
         h-6 w-6 text-foreground transition-transform
         group-hover:scale-110
       "
              />
            </button>

            <div
              className="
        bg-card absolute top-6 right-6 z-110 flex items-center gap-2 rounded-2xl
        border-2 border-border p-1.5 shadow-2xl
      "
            >
              <button
                onClick={handleZoomIn}
                className="
         rounded-xl p-2.5 text-foreground transition-colors
         hover:bg-muted
       "
              >
                <ZoomIn className="size-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="
         rounded-xl p-2.5 text-foreground transition-colors
         hover:bg-muted
       "
              >
                <ZoomOut className="size-5" />
              </button>
              <button
                onClick={handleReset}
                className="
         rounded-xl p-2.5 text-foreground transition-colors
         hover:bg-muted
       "
              >
                <RotateCcw className="size-5" />
              </button>
            </div>

            {/* 大图滚动区域 */}
            <div
              className="
         flex h-full w-full items-center justify-center overflow-auto p-4 pt-24
         md:p-20
       "
              onClick={toggleLightbox}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{
                  scale: zoom,
                  opacity: 1,
                  transition: { type: 'spring', damping: 30, stiffness: 200 },
                }}
                onClick={(e) => e.stopPropagation()}
                className="relative flex items-center justify-center"
              >
                <div
                  className="
           not-prose
           [&>svg]:h-auto! [&>svg]:min-h-100 [&>svg]:max-w-none!
           [&>svg]:overflow-visible
         "
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </motion.div>
            </div>

            <div
              className="
        pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2
        rounded-full border-2 border-primary/20 bg-primary/10 px-5 py-2
        text-[11px] font-black tracking-widest text-primary uppercase shadow-lg
      "
            >
              {t('zoomInstruction')} {/* Mermaid/zoomInstruction 使用上方工具栏缩放 • 移动端可双指操作 */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
