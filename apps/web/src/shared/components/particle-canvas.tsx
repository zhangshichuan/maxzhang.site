'use client'

import { useEffect, useRef } from 'react'

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    let w = innerWidth
    let h = innerHeight
    const particles: Particle[] = []
    const mouse = { x: 0.5 * innerWidth, y: 0.5 * innerHeight }

    function resize() {
      w = innerWidth
      h = innerHeight
      c!.width = w
      c!.height = h
    }
    c.width = w
    c.height = h
    window.addEventListener('resize', resize)

    class Particle {
      x!: number
      y!: number
      z!: number
      vx!: number
      vy!: number
      r!: number
      hue!: number
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.z = Math.random() * 400 + 30
        this.vx = (Math.random() - 0.5) * 0.25
        this.vy = (Math.random() - 0.5) * 0.25
        this.r = 0.5 + Math.random() * 2
        this.hue = Math.random() > 0.5 ? 290 : 200
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        this.z -= 0.3
        if (this.z < 8) {
          this.z = 400
          this.x = Math.random() * w
          this.y = Math.random() * h
        }
        if (this.x < 0 || this.x > w) this.vx *= -1
        if (this.y < 0 || this.y > h) this.vy *= -1
      }
      draw() {
        const s = 180 / this.z
        const px = (this.x - mouse.x * s) * s + mouse.x
        const py = (this.y - mouse.y * s) * s + mouse.y
        const alpha = Math.min(0.9, 80 / this.z)
        const sr = this.r * s
        ctx!.beginPath()
        ctx!.arc(px, py, sr, 0, Math.PI * 2)
        const lum = this.hue === 290 ? '255,45,149' : '0,229,255'
        ctx!.fillStyle = `rgba(${lum},${alpha})`
        ctx!.fill()
      }
    }

    for (let i = 0; i < 150; i++) particles.push(new Particle())

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      mouse.x = e.touches[0].clientX
      mouse.y = e.touches[0].clientY
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('touchmove', onTouchMove, { passive: true })

    let animId: number
    const renderFrame = () => {
      ctx!.fillStyle = 'rgba(2,0,8,.12)'
      ctx!.fillRect(0, 0, w, h)
      for (const p of particles) {
        p.update()
        p.draw()
      }
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderFrame() // 静态单帧，不做动画
    } else {
      ;(function anim() {
        renderFrame()
        animId = requestAnimationFrame(anim)
      })()
    }

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('touchmove', onTouchMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} id="bg" />
      <div className="scanline" />
      <div className="noise" />
    </>
  )
}
