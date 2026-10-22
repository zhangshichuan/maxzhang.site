'use client'

import { useEffect, useRef } from 'react'

/**
 * Kinetic signal field — 2D contour lines driven by time + pointer.
 * Lives behind the homepage hero only; no global canvas.
 */
export function KineticField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0
    let started = performance.now()
    let pointerX = -9999
    let pointerY = -9999
    let targetX = -9999
    let targetY = -9999

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const rows = 30
    const cols = 110

    const draw = (now: number) => {
      if (!width || !height) {
        raf = requestAnimationFrame(draw)
        return
      }

      const t = (now - started) / 1000
      pointerX += (targetX - pointerX) * 0.08
      pointerY += (targetY - pointerY) * 0.08

      ctx.clearRect(0, 0, width, height)

      // ambient cobalt light at the lower centre
      const glow = ctx.createRadialGradient(width * 0.62, height * 0.78, 0, width * 0.62, height * 0.78, height * 0.8)
      glow.addColorStop(0, 'rgba(47, 75, 255, 0.22)')
      glow.addColorStop(0.42, 'rgba(47, 75, 255, 0.06)')
      glow.addColorStop(1, 'rgba(47, 75, 255, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      for (let row = 0; row < rows; row += 1) {
        const depth = row / (rows - 1)
        const baseY = height * (0.28 + Math.pow(depth, 1.62) * 0.7)
        const amp = height * (0.004 + depth * 0.03)
        const phase = t * 0.32 + row * 0.41

        ctx.beginPath()
        for (let col = 0; col <= cols; col += 1) {
          const u = col / cols
          const x = u * width
          let y =
            baseY +
            Math.sin(u * 7.4 + phase) * amp +
            Math.sin(u * 17.2 - t * 0.52 + row * 0.27) * amp * 0.42 +
            Math.sin(u * 2.1 + t * 0.18 + row * 0.6) * amp * 0.5

          if (pointerX > -999) {
            const dx = x - pointerX
            const dy = y - pointerY
            const dist = Math.hypot(dx, dy)
            const ripple = Math.exp(-(dist * dist) / (2 * 180 * 180))
            y += Math.sin(dist * 0.035 - t * 3.2) * ripple * 14
          }

          if (col === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        const bone = row % 7 === 0
        const alpha = 0.035 + depth * 0.22
        ctx.strokeStyle = bone ? `rgba(244, 239, 230, ${alpha * 0.9})` : `rgba(85, 105, 255, ${alpha})`
        ctx.lineWidth = row % 7 === 0 ? 1.1 : 0.75
        ctx.stroke()
      }

      // sparse vertical mesh, fades with depth
      ctx.lineWidth = 0.6
      for (let col = 4; col < cols; col += 8) {
        const u = col / cols
        const x = u * width
        const baseY = height * 0.28
        const endY = height * 0.98
        const g = ctx.createLinearGradient(0, baseY, 0, endY)
        g.addColorStop(0, 'rgba(82, 102, 255, 0)')
        g.addColorStop(0.5, 'rgba(82, 102, 255, 0.05)')
        g.addColorStop(1, 'rgba(82, 102, 255, 0.02)')
        ctx.strokeStyle = g
        ctx.beginPath()
        ctx.moveTo(x, baseY)
        ctx.lineTo(x, endY)
        ctx.stroke()
      }

      // cursor halo
      if (pointerX > -999) {
        const halo = ctx.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, 180)
        halo.addColorStop(0, 'rgba(244, 239, 230, 0.09)')
        halo.addColorStop(0.4, 'rgba(47, 75, 255, 0.08)')
        halo.addColorStop(1, 'rgba(47, 75, 255, 0)')
        ctx.fillStyle = halo
        ctx.fillRect(pointerX - 180, pointerY - 180, 360, 360)
      }

      raf = requestAnimationFrame(draw)
    }

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetX = event.clientX - rect.left
      targetY = event.clientY - rect.top
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('pointermove', onPointer, { passive: true })

    if (reduce) {
      draw(performance.now())
      cancelAnimationFrame(raf)
    } else {
      raf = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return <canvas ref={canvasRef} className="zx-field" aria-hidden="true" />
}
