/**
 * Mermaid图表组件
 *
 * 渲染Mermaid流程图、时序图等图表，跟随深浅色模式重渲染，
 * 支持全屏预览（iOS Sheet）与缩放。
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'
import mermaid from 'mermaid'
import { useEffect, useState } from 'react'
import { useTranslations } from '@/src/i18n/client'
import { useAppearance } from '@/src/shared/theme'

/** Mermaid组件属性接口 */
interface MermaidProps {
  chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
  const t = useTranslations('Mermaid')
  const { resolvedMode } = useAppearance()
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const dark = resolvedMode === 'dark'
    const themeVariables = dark
      ? {
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          primaryColor: '#1c1c1e',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#3a3a3c',
          lineColor: '#98989f',
          secondaryColor: '#2c2c2e',
          tertiaryColor: '#1c1c1e',
          clusterBkg: '#2c2c2e',
          clusterBorder: '#3a3a3c',
        }
      : {
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          primaryColor: '#f2f2f7',
          primaryTextColor: '#000000',
          primaryBorderColor: '#c7c7cc',
          lineColor: '#8e8e93',
          secondaryColor: '#ffffff',
          tertiaryColor: '#f2f2f7',
          clusterBkg: '#ffffff',
          clusterBorder: '#d1d1d6',
        }

    mermaid.initialize({
      startOnLoad: false,
      theme: dark ? 'dark' : 'base',
      securityLevel: 'loose',
      fontFamily: 'var(--font-sans)',
      themeVariables,
      flowchart: {
        htmlLabels: true,
        useMaxWidth: true,
        padding: 30,
      },
    })

    const renderChart = async () => {
      if (!chart) return
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

    renderChart()
  }, [chart, resolvedMode])

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
      <div className="alert alert-error" style={{ margin: '16px 0', padding: 16, fontSize: 13 }}>
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="mermaid-frame group" onClick={toggleLightbox}>
        <div className="mermaid-svg" dangerouslySetInnerHTML={{ __html: svg }} />

        <div className="mermaid-toolbar">
          <Maximize2 className="size-3.5 text-primary" />
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
            className="mermaid-lightbox"
          >
            <button onClick={toggleLightbox} className="mermaid-lightbox-close" aria-label={t('close')}>
              <X className="mx-auto size-5" />
            </button>

            <div className="mermaid-lightbox-toolbar">
              <button onClick={handleZoomIn} className="icon-btn icon-btn-sm" aria-label={t('zoomIn')}>
                <ZoomIn className="size-4" />
              </button>
              <button onClick={handleZoomOut} className="icon-btn icon-btn-sm" aria-label={t('zoomOut')}>
                <ZoomOut className="size-4" />
              </button>
              <button onClick={handleReset} className="icon-btn icon-btn-sm" aria-label={t('reset')}>
                <RotateCcw className="size-4" />
              </button>
            </div>

            <div className="mermaid-lightbox-stage" onClick={toggleLightbox}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{
                  scale: zoom,
                  opacity: 1,
                  transition: { type: 'spring', damping: 30, stiffness: 200 },
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div dangerouslySetInnerHTML={{ __html: svg }} />
              </motion.div>
            </div>

            <div className="mermaid-zoom-hint">{t('zoomInstruction')}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
