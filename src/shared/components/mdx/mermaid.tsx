/**
 * Mermaid图表组件
 *
 * 渲染Mermaid流程图、时序图等图表，支持全屏预览和缩放功能
 * 包含灯箱模式，用户可点击图表放大查看细节
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'
import mermaid from 'mermaid'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

/** Mermaid组件属性接口 */
interface MermaidProps {
  chart: string // Mermaid图表定义代码
}

export default function Mermaid({ chart }: MermaidProps) {
  const t = useTranslations('Mermaid')
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
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
  }, [chart])

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

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((prev) => Math.min(prev + 0.2, 4))
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((prev) => Math.max(prev - 0.2, 0.3))
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom(1)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (isLightboxOpen) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.3), 4))
    }
  }

  if (error) {
    return (
      <div
        style={{ margin: '16px 0', border: '1px solid var(--neon)', padding: 16, fontSize: 13, color: 'var(--neon)' }}
      >
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="group relative my-12 cursor-zoom-in">
        <div
          onClick={toggleLightbox}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: 600,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,.06)',
            background: 'var(--card)',
            padding: '24px 40px',
            transition: 'all .25s',
            cursor: 'pointer',
          }}
        >
          <div
            className="[&>svg]:size-auto [&>svg]:max-h-[540px] [&>svg]:max-w-full [&>svg]:object-contain"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(255,255,255,.08)',
            background: 'rgba(2,0,8,.6)',
            backdropFilter: 'blur(12px)',
            padding: '4px 12px',
            opacity: 0,
            transition: 'opacity .3s',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'rgba(255,255,255,.5)',
          }}
          className="group-hover:opacity-100"
        >
          <Maximize2 style={{ width: 14, height: 14, color: 'var(--neon)' }} />
          <span>{t('clickToZoom')}</span>
        </div>
      </div>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onWheel={handleWheel}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(2,0,8,.98)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <button
              onClick={toggleLightbox}
              style={{
                position: 'absolute',
                top: 24,
                left: 24,
                zIndex: 110,
                background: 'var(--card)',
                border: '1px solid rgba(255,255,255,.06)',
                padding: 12,
                cursor: 'pointer',
                transition: 'all .25s',
              }}
            >
              <X style={{ width: 24, height: 24, color: 'var(--fg)' }} />
            </button>

            <div
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                zIndex: 110,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--card)',
                border: '1px solid rgba(255,255,255,.06)',
                padding: 6,
              }}
            >
              <button
                onClick={handleZoomIn}
                style={{
                  padding: 10,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--fg)',
                }}
              >
                <ZoomIn style={{ width: 20, height: 20 }} />
              </button>
              <button
                onClick={handleZoomOut}
                style={{
                  padding: 10,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--fg)',
                }}
              >
                <ZoomOut style={{ width: 20, height: 20 }} />
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: 10,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--fg)',
                }}
              >
                <RotateCcw style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                overflow: 'auto',
                padding: '80px 16px 16px',
              }}
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
              >
                <div
                  className="[&>svg]:h-auto! [&>svg]:min-h-[400px] [&>svg]:max-w-none! [&>svg]:overflow-visible"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </motion.div>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 32,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255,45,149,.1)',
                border: '1px solid rgba(255,45,149,.2)',
                padding: '8px 20px',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: 'var(--neon)',
              }}
            >
              {t('zoomInstruction')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
