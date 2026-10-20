import { useEffect, useRef } from 'react'

const PAPER = '#0b0a08'
const INK = '#ece7dc'
const RED = '#ff4b2f'
const TAU = Math.PI * 2
const MOBILE_BREAKPOINT = 900
const DESKTOP_PARTICLES = 2200
const MOBILE_PARTICLES = 950

interface Particle {
  x: number
  y: number
  px: number
  py: number
  vx: number
  vy: number
  life: number
  maxLife: number
  group: 0 | 1 | 2 | 3
  speedScale: number
}

interface Impulse {
  x: number
  y: number
  start: number
  life: number
  power: number
}

interface ClearZone {
  el: HTMLElement
  pad: number
}

interface ClearRect {
  l: number
  t: number
  r: number
  b: number
}

interface GlyphPoint {
  x: number
  y: number
}

interface MorphPart {
  sx: number
  sy: number
  tx: number
  ty: number
  x: number
  y: number
  delay: number
  size: number
  red: boolean
  vx: number
  vy: number
}

type MorphState = 'idle' | 'form' | 'hold' | 'scatter' | 'done'

interface Morph {
  state: MorphState
  start: number
  holdStart: number
  scatterStart: number
  parts: MorphPart[]
  stage: HTMLElement | null
  formDuration: number
  delayMax: number
  holdDuration: number
  scatterDuration: number
}

interface PointerState {
  x: number
  y: number
  px: number
  py: number
  speed: number
  active: boolean
  touching: boolean
}

declare global {
  interface Window {
    __READY__?: boolean
  }
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value
}

function hash2(x: number, y: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}

function noise2(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

export default function FlowField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wipeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wipeEl = wipeRef.current
    if (!canvas) return

    const canvasEl: HTMLCanvasElement = canvas
    const rootEl = document.documentElement
    const search = new URLSearchParams(window.location.search)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isStatic = search.has('static') || reduced
    if (isStatic) rootEl.classList.add('no-motion')

    let context: CanvasRenderingContext2D | null = null
    try {
      context = canvas.getContext('2d', { alpha: false })
    } catch {
      context = null
    }

    if (!context) {
      window.__READY__ = true
      return () => {
        rootEl.classList.remove('no-motion')
        window.__READY__ = false
      }
    }

    const ctx = context
    let disposed = false
    const controller = new AbortController()
    const { signal } = controller
    const timeoutIds: number[] = []
    const wipeAnimations: Animation[] = []
    let resizeTimer = 0
    let rafId = 0
    let chaptersObserver: IntersectionObserver | null = null

    let W = window.innerWidth
    let H = window.innerHeight
    let dpr = 1
    let isMobile = W <= MOBILE_BREAKPOINT
    let baseSpeed = isMobile ? 0.58 : 0.72

    const particles: Particle[] = []
    const impulses: Impulse[] = []
    const clearZones: ClearZone[] = []
    const seenChapters = new Set<HTMLElement>()
    const pointer: PointerState = {
      x: W * 0.68,
      y: H * 0.42,
      px: W * 0.68,
      py: H * 0.42,
      speed: 0,
      active: false,
      touching: false,
    }
    const morph: Morph = {
      state: 'idle',
      start: 0,
      holdStart: 0,
      scatterStart: 0,
      parts: [],
      stage: null,
      formDuration: 720,
      delayMax: 150,
      holdDuration: 1250,
      scatterDuration: 650,
    }
    const collapse: { el: HTMLElement | null; until: number } = { el: null, until: 0 }

    let lastScrollY = window.scrollY || 0
    let scrollEnergy = 0
    let lastT = 0
    let fontsReady = false

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms)
      timeoutIds.push(id)
      return id
    }

    /* ---------- curl noise ---------- */
    function potential(x: number, y: number, time: number) {
      const a = noise2(x * 0.0016 + 1.7, y * 0.0016 + time * 0.13)
      const b = noise2(x * 0.0034 + 17.2 + time * 0.03, y * 0.0034 - 9.7 - time * 0.21)
      return a + 0.5 * b
    }

    function curlAngle(x: number, y: number, time: number) {
      const e = 16
      const dpdx = potential(x + e, y, time) - potential(x - e, y, time)
      const dpdy = potential(x, y + e, time) - potential(x, y - e, time)
      return Math.atan2(-dpdx, dpdy)
    }

    /* ---------- particles ---------- */
    function spawn(p: Particle, initial: boolean) {
      p.x = rand(-20, W + 20)
      p.y = rand(-20, H + 20)
      p.px = p.x
      p.py = p.y
      const angle = rand(0, TAU)
      const speed = rand(0.15, 1.1)
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed
      p.life = initial ? rand(0, 500) : 0
      p.maxLife = rand(420, 1150)
      const roll = Math.random()
      p.group = roll < 0.04 ? 3 : roll < 0.55 ? 0 : roll < 0.85 ? 1 : 2
      p.speedScale = rand(0.65, 1.4)
    }

    function buildParticles() {
      particles.length = 0
      const total = isMobile ? MOBILE_PARTICLES : DESKTOP_PARTICLES
      for (let i = 0; i < total; i += 1) {
        const particle = {} as Particle
        spawn(particle, true)
        particles.push(particle)
      }
    }

    /* ---------- wind shadows around type ---------- */
    function collectClearZones() {
      clearZones.length = 0
      const hero = document.getElementById('heroCopy')
      if (hero) clearZones.push({ el: hero, pad: 22 })
      const foot = document.querySelector<HTMLElement>('.hero-foot-inner')
      if (foot) clearZones.push({ el: foot, pad: 14 })
      const pre = document.querySelector<HTMLElement>('.contact-pre')
      if (pre) clearZones.push({ el: pre, pad: 24 })
      const sheet = document.querySelector<HTMLElement>('.contact-sheet')
      if (sheet) clearZones.push({ el: sheet, pad: 18 })
    }

    function getClearRects() {
      const rects: ClearRect[] = []
      for (let i = 0; i < clearZones.length; i += 1) {
        const zone = clearZones[i]
        const r = zone.el.getBoundingClientRect()
        if (r.width < 2 || r.height < 2) continue
        rects.push({
          l: r.left - zone.pad,
          t: r.top - zone.pad,
          r: r.right + zone.pad,
          b: r.bottom + zone.pad,
        })
      }
      if ((morph.state === 'form' || morph.state === 'hold') && morph.stage) {
        const r = morph.stage.getBoundingClientRect()
        if (r.width > 2 && r.height > 2) {
          rects.push({ l: r.left - 8, t: r.top - 8, r: r.right + 8, b: r.bottom + 8 })
        }
      }
      return rects
    }

    /* ---------- canvas sizing ---------- */
    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      canvasEl.width = Math.round(W * dpr)
      canvasEl.height = Math.round(H * dpr)
      canvasEl.style.width = `${W}px`
      canvasEl.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = PAPER
      ctx.fillRect(0, 0, W, H)
    }

    /* ---------- impulses ---------- */
    function addImpulse(x: number, y: number, power: number, life = 950) {
      impulses.push({ x, y, start: performance.now(), life, power })
      if (impulses.length > 6) impulses.shift()
    }

    /* ---------- physics ---------- */
    function step(dt: number, now: number) {
      const time = now * 0.001
      const scrollY = window.scrollY || window.pageYOffset
      const delta = scrollY - lastScrollY
      lastScrollY = scrollY
      scrollEnergy += delta
      scrollEnergy *= 0.9
      const windY = clamp(scrollEnergy * 0.032, -7, 7)
      const windX = Math.sin(time * 0.7) * Math.abs(windY) * 0.4

      if (pointer.active) {
        pointer.speed =
          pointer.speed * 0.9 + Math.min(70, Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py)) * 0.1
        pointer.px = pointer.x
        pointer.py = pointer.y
      } else {
        pointer.speed *= 0.9
      }

      const rects = getClearRects()
      const pointerRadius = 170
      const swirl = clamp(pointer.speed * 0.075, 0.3, 4.5)

      let sinkPoint: { x: number; y: number } | null = null
      let sinkPower = 0
      if (collapse.el && now < collapse.until) {
        const r = collapse.el.getBoundingClientRect()
        if (r.bottom > -40 && r.top < H + 40 && r.width > 0) {
          sinkPoint = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
          sinkPower = 320
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]
        const angle = curlAngle(p.x, p.y, time)
        const targetVx = Math.cos(angle) * baseSpeed * p.speedScale
        const targetVy = Math.sin(angle) * baseSpeed * p.speedScale
        p.vx += (targetVx - p.vx) * 0.08 * dt
        p.vy += (targetVy - p.vy) * 0.08 * dt

        p.vx += windX * 0.12 * dt
        p.vy += windY * 0.15 * dt

        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const distSq = dx * dx + dy * dy
          if (distSq < pointerRadius * pointerRadius) {
            const dist = Math.sqrt(distSq) || 1
            const falloff = 1 - dist / pointerRadius
            const tangentX = -dy / dist
            const tangentY = dx / dist
            p.vx += tangentX * falloff * falloff * swirl * 2.1 * dt + (dx / dist) * falloff * 0.3 * dt
            p.vy += tangentY * falloff * falloff * swirl * 2.1 * dt + (dy / dist) * falloff * 0.3 * dt
          }
        }

        for (let k = 0; k < impulses.length; k += 1) {
          const impulse = impulses[k]
          const age = now - impulse.start
          if (age < 0 || age > impulse.life) continue
          const dx = p.x - impulse.x
          const dy = p.y - impulse.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const fade = 1 - age / impulse.life
          const wave = age * 1.35
          const band = Math.abs(dist - wave)
          if (band < 170) {
            const force = (1 - band / 170) * fade * impulse.power * 0.11
            p.vx += (dx / dist) * force * dt
            p.vy += (dy / dist) * force * dt
          }
          if (age < 150) {
            const kick = (1 - age / 150) * impulse.power * 0.05
            p.vx += (dx / dist) * kick * dt
            p.vy += (dy / dist) * kick * dt
          }
        }

        if (sinkPoint) {
          const dx = sinkPoint.x - p.x
          const dy = sinkPoint.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const pull = sinkPower * Math.exp(-dist / 320) * 0.012
          p.vx += (dx / dist) * pull * dt
          p.vy += (dy / dist) * pull * dt
        }

        for (let r = 0; r < rects.length; r += 1) {
          const rect = rects[r]
          if (p.x > rect.l && p.x < rect.r && p.y > rect.t && p.y < rect.b) {
            const dLeft = p.x - rect.l
            const dRight = rect.r - p.x
            const dTop = p.y - rect.t
            const dBottom = rect.b - p.y
            const nearest = Math.min(dLeft, dRight, dTop, dBottom)
            if (nearest === dLeft) p.vx -= 1.5 * dt
            else if (nearest === dRight) p.vx += 1.5 * dt
            else if (nearest === dTop) p.vy -= 1.5 * dt
            else p.vy += 1.5 * dt
            p.vx *= 0.95
            p.vy *= 0.95
          }
        }

        const maxSpeed = isMobile ? 3.0 : 3.6
        const speedSq = p.vx * p.vx + p.vy * p.vy
        if (speedSq > maxSpeed * maxSpeed) {
          const scale = maxSpeed / Math.sqrt(speedSq)
          p.vx *= scale
          p.vy *= scale
        }
        p.px = p.x
        p.py = p.y
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vx *= 0.992
        p.vy *= 0.992
        p.life += dt * 1.5
        if (p.life > p.maxLife || p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30) {
          spawn(p, false)
        }
      }

      for (let j = impulses.length - 1; j >= 0; j -= 1) {
        if (now - impulses[j].start > impulses[j].life + 200) impulses.splice(j, 1)
      }
    }

    /* ---------- drawing ---------- */
    function strokeGroup(group: number, alpha: number, lineWidth: number, color: string, dim: number) {
      ctx.globalAlpha = alpha * dim
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.beginPath()
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]
        if (p.group !== group) continue
        ctx.moveTo(p.px, p.py)
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }

    function drawFrame(now: number) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(11, 10, 8,0.105)'
      ctx.globalAlpha = 1
      ctx.fillRect(0, 0, W, H)

      const dim = morph.state === 'form' || morph.state === 'hold' ? 0.5 : 1
      ctx.lineCap = 'round'
      strokeGroup(0, 0.44, 0.75, INK, dim)
      strokeGroup(1, 0.55, 1.06, INK, dim)
      strokeGroup(2, 0.66, 1.7, INK, dim)
      strokeGroup(3, 0.75, 1.15, RED, dim)

      if (pointer.active && !isMobile) {
        const radius = 30 + Math.min(34, pointer.speed * 0.7)
        ctx.globalAlpha = 0.16
        ctx.strokeStyle = INK
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, radius, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = 0.5
        ctx.fillStyle = INK
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 1.6, 0, TAU)
        ctx.fill()
      }

      for (let i = 0; i < impulses.length; i += 1) {
        const impulse = impulses[i]
        const age = now - impulse.start
        if (age < 0 || age > impulse.life) continue
        const radius = age * 1.35
        const alpha = (1 - age / impulse.life) * 0.16
        ctx.globalAlpha = alpha
        ctx.strokeStyle = INK
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(impulse.x, impulse.y, radius, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = alpha * 0.6
        ctx.beginPath()
        ctx.arc(impulse.x, impulse.y, Math.max(0, radius - 46), 0, TAU)
        ctx.stroke()
      }

      if (collapse.el && now < collapse.until) {
        const r = collapse.el.getBoundingClientRect()
        if (r.bottom > -40 && r.top < H + 40 && r.width > 0) {
          const cx = r.left + r.width / 2
          const cy = r.top + r.height / 2
          const progress = clamp((now - (collapse.until - 2400)) / 700, 0, 1)
          const solidRadius = 4 + progress * 7
          ctx.globalAlpha = 0.88
          ctx.fillStyle = INK
          ctx.beginPath()
          ctx.arc(cx, cy, solidRadius, 0, TAU)
          ctx.fill()
          ctx.globalAlpha = 0.07
          ctx.beginPath()
          ctx.arc(cx, cy, solidRadius + 16, 0, TAU)
          ctx.fill()
        }
      }

      drawMorph(now)
    }

    /* ---------- particle glyph +80% ---------- */
    function sampleGlyph(text: string, targetWidth: number) {
      const fontSize = 300
      const offscreen = document.createElement('canvas')
      let offscreenCtx = offscreen.getContext('2d')
      if (!offscreenCtx) return [] as GlyphPoint[]
      const font = `900 ${fontSize}px Inter, "Noto Sans SC", sans-serif`
      offscreenCtx.font = font
      const textWidth = offscreenCtx.measureText(text).width
      const width = Math.ceil(textWidth) + 80
      const height = fontSize + 120
      offscreen.width = width
      offscreen.height = height
      offscreenCtx = offscreen.getContext('2d')
      if (!offscreenCtx) return [] as GlyphPoint[]
      offscreenCtx.font = font
      offscreenCtx.fillStyle = '#000'
      offscreenCtx.textAlign = 'center'
      offscreenCtx.textBaseline = 'middle'
      offscreenCtx.fillText(text, width / 2, height / 2)
      const data = offscreenCtx.getImageData(0, 0, width, height).data
      const points: GlyphPoint[] = []
      const gap = 3
      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          if (data[(y * width + x) * 4 + 3] > 140) points.push({ x: x - width / 2, y: y - height / 2 })
        }
      }
      const scale = targetWidth / width
      return points.map((point) => ({ x: point.x * scale, y: point.y * scale }))
    }

    function startMorph() {
      if (isMobile || isStatic) return
      if (morph.state === 'form' || morph.state === 'hold') return
      const stage = document.querySelector<HTMLElement>('.glyph-stage')
      if (!stage) return
      morph.stage = stage
      if (!fontsReady && document.fonts?.ready) {
        document.fonts.ready.then(
          () => {
            fontsReady = true
            if (!disposed) startMorph()
          },
          () => {
            fontsReady = true
            if (!disposed) startMorph()
          },
        )
        return
      }
      const rect = stage.getBoundingClientRect()
      if (rect.width < 40) return
      const targetWidth = Math.min(rect.width * 0.92, 600)
      const points = sampleGlyph('+80%', targetWidth)
      if (!points.length) return
      for (let i = points.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = points[i]
        points[i] = points[j]
        points[j] = tmp
      }
      const limit = Math.min(points.length, isMobile ? 600 : 1600)
      const parts: MorphPart[] = []
      for (let k = 0; k < limit; k += 1) {
        const source = particles[Math.floor(Math.random() * particles.length)] ?? { x: W / 2, y: H / 2 }
        parts.push({
          sx: source.x,
          sy: source.y,
          tx: points[k].x,
          ty: points[k].y,
          x: source.x,
          y: source.y,
          delay: Math.random() * morph.delayMax,
          size: rand(1.7, 3.2),
          red: Math.random() < 0.05,
          vx: 0,
          vy: 0,
        })
      }
      morph.parts = parts
      morph.state = 'form'
      morph.start = performance.now()
    }

    function drawMorph(now: number) {
      if (morph.state === 'idle' || morph.state === 'done') return
      const stage = morph.stage
      if (!stage) return
      const rect = stage.getBoundingClientRect()
      if (rect.width < 20) return
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const elapsed = now - morph.start

      if (morph.state === 'form') {
        if (elapsed > morph.formDuration + morph.delayMax) {
          morph.state = 'hold'
          morph.holdStart = now
        }
      } else if (morph.state === 'hold') {
        if (now - morph.holdStart > morph.holdDuration) {
          morph.state = 'scatter'
          morph.scatterStart = now
          for (let s = 0; s < morph.parts.length; s += 1) {
            const part = morph.parts[s]
            const angle = rand(0, TAU)
            const speed = rand(1.6, 4.6)
            part.vx = Math.cos(angle) * speed
            part.vy = Math.sin(angle) * speed
          }
        }
      } else if (morph.state === 'scatter') {
        if (now - morph.scatterStart > morph.scatterDuration) {
          morph.state = 'done'
          morph.parts = []
          return
        }
      }

      ctx.globalCompositeOperation = 'source-over'
      if (morph.state === 'form' || morph.state === 'hold') {
        const washRadius = Math.max(260, Math.min(rect.width, rect.height) * 0.95)
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, washRadius)
        gradient.addColorStop(0, 'rgba(11, 10, 8,0.88)')
        gradient.addColorStop(0.62, 'rgba(11, 10, 8,0.62)')
        gradient.addColorStop(1, 'rgba(11, 10, 8,0)')
        ctx.globalAlpha = 1
        ctx.fillStyle = gradient
        ctx.fillRect(cx - washRadius, cy - washRadius, washRadius * 2, washRadius * 2)
      }
      const parts = morph.parts
      for (let i = 0; i < parts.length; i += 1) {
        const part = parts[i]
        let x = 0
        let y = 0
        let alpha = 0
        if (morph.state === 'form') {
          const local = clamp((elapsed - part.delay) / morph.formDuration, 0, 1)
          const eased = 1 - Math.pow(1 - local, 3)
          x = part.sx + (cx + part.tx - part.sx) * eased
          y = part.sy + (cy + part.ty - part.sy) * eased
          alpha = 0.35 + 0.65 * eased
        } else if (morph.state === 'hold') {
          x = cx + part.tx
          y = cy + part.ty
          alpha = 1
        } else if (morph.state === 'scatter') {
          part.x += part.vx
          part.y += part.vy
          part.vx *= 0.985
          part.vy *= 0.985
          x = part.x
          y = part.y
          alpha = 0.95 * (1 - (now - morph.scatterStart) / morph.scatterDuration)
        }
        ctx.globalAlpha = Math.max(0, alpha)
        ctx.fillStyle = part.red ? RED : INK
        ctx.fillRect(x - part.size / 2, y - part.size / 2, part.size, part.size)
      }
    }

    /* ---------- static / reduced-motion poster ---------- */
    function renderStatic() {
      const now = performance.now()
      for (let i = 0; i < 220; i += 1) step(1, now + i * 16)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.fillStyle = PAPER
      ctx.fillRect(0, 0, W, H)
      ctx.lineCap = 'round'
      const streak = (group: number, alpha: number, lineWidth: number, color: string) => {
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.beginPath()
        for (let j = 0; j < particles.length; j += 1) {
          const p = particles[j]
          if (p.group !== group) continue
          ctx.moveTo(p.x - p.vx * 14, p.y - p.vy * 14)
          ctx.lineTo(p.x, p.y)
        }
        ctx.stroke()
      }
      streak(0, 0.42, 0.75, INK)
      streak(1, 0.55, 1.06, INK)
      streak(2, 0.66, 1.7, INK)
      streak(3, 0.78, 1.15, RED)
    }

    /* ---------- main loop ---------- */
    function loop(now: number) {
      rafId = requestAnimationFrame(loop)
      if (document.hidden) return
      if (!lastT) lastT = now
      const dt = clamp((now - lastT) / 16.667, 0.25, 2.2)
      lastT = now
      step(dt, now)
      drawFrame(now)
    }

    /* ---------- chapter triggers ---------- */
    function setupChapters() {
      const chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
      if (isStatic || !('IntersectionObserver' in window)) {
        chapters.forEach((el) => el.classList.add('is-in'))
        return
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const el = entry.target as HTMLElement
            el.classList.add('is-in')
            if (seenChapters.has(el)) return
            seenChapters.add(el)
            const index = chapters.indexOf(el)
            const originX = index % 2 === 0 ? W * 0.76 : W * 0.24
            const originY = H * (0.36 + 0.12 * (index % 3))
            addImpulse(originX, originY, index === 0 ? 34 : 24, 1050)
            if (el.id === 'numbers') startMorph()
            if (el.id === 'contact') {
              collapse.el = document.querySelector<HTMLElement>('.contact-stop')
              collapse.until = performance.now() + 2400
            }
          })
        },
        { threshold: 0.25, rootMargin: '0px 0px -6% 0px' },
      )
      chaptersObserver = observer
      chapters.forEach((el) => observer.observe(el))
    }

    /* ---------- nav transition ---------- */
    function playWipe() {
      if (!wipeEl || reduced || isStatic) return
      wipeAnimations.forEach((animation) => animation.cancel())
      wipeAnimations.length = 0
      const animation = wipeEl.animate([{ opacity: 0 }, { opacity: 0.82, offset: 0.27 }, { opacity: 0 }], {
        duration: 450,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      })
      wipeAnimations.push(animation)
    }

    function setupNav() {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-jump]'))
      links.forEach((link) => {
        link.addEventListener(
          'click',
          (event) => {
            const href = link.getAttribute('href') ?? ''
            if (!href.startsWith('#')) return
            const target = document.querySelector<HTMLElement>(href)
            if (!target) return
            event.preventDefault()
            addImpulse(event.clientX || W / 2, event.clientY || H / 2, 70, 900)
            playWipe()
            const top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset)
            later(() => {
              if (disposed) return
              window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
            }, 170)
          },
          { signal },
        )
      })
    }

    /* ---------- pointer / touch ---------- */
    function setupPointer() {
      window.addEventListener(
        'pointermove',
        (event) => {
          if (event.pointerType === 'touch') return
          pointer.active = true
          pointer.x = event.clientX
          pointer.y = event.clientY
        },
        { passive: true, signal },
      )
      window.addEventListener(
        'pointerleave',
        () => {
          pointer.active = false
        },
        { passive: true, signal },
      )
      window.addEventListener(
        'pointerdown',
        (event) => {
          if (event.pointerType === 'touch') {
            pointer.active = true
            pointer.touching = true
            pointer.x = event.clientX
            pointer.y = event.clientY
            pointer.px = event.clientX
            pointer.py = event.clientY
          } else {
            addImpulse(event.clientX, event.clientY, 46, 850)
          }
        },
        { passive: true, signal },
      )
      window.addEventListener(
        'pointerup',
        () => {
          pointer.touching = false
        },
        { passive: true, signal },
      )
      window.addEventListener(
        'touchmove',
        (event) => {
          const touch = event.touches[0]
          if (!touch) return
          pointer.active = true
          pointer.touching = true
          pointer.x = touch.clientX
          pointer.y = touch.clientY
        },
        { passive: true, signal },
      )
      window.addEventListener(
        'touchend',
        () => {
          pointer.touching = false
          if (isMobile) pointer.active = false
        },
        { passive: true, signal },
      )
    }

    /* ---------- header auto-hide ---------- */
    function setupHeader() {
      const header = document.querySelector<HTMLElement>('.site-header')
      if (!header) return
      let lastY = window.scrollY || 0
      window.addEventListener(
        'scroll',
        () => {
          const y = window.scrollY || window.pageYOffset || 0
          if (y > 160 && y > lastY + 2) header.classList.add('is-hidden')
          else if (y < lastY - 2 || y < 90) header.classList.remove('is-hidden')
          lastY = y
        },
        { passive: true, signal },
      )
    }

    /* ---------- resize / visibility ---------- */
    function setupResize() {
      window.addEventListener(
        'resize',
        () => {
          window.clearTimeout(resizeTimer)
          resizeTimer = window.setTimeout(() => {
            const wasMobile = isMobile
            isMobile = window.innerWidth <= MOBILE_BREAKPOINT
            baseSpeed = isMobile ? 0.58 : 0.72
            resizeCanvas()
            if (isStatic) renderStatic()
            else if (wasMobile !== isMobile) buildParticles()
            collectClearZones()
          }, 180)
        },
        { passive: true, signal },
      )
    }

    function setupVisibility() {
      document.addEventListener(
        'visibilitychange',
        () => {
          if (document.hidden) {
            if (rafId) {
              cancelAnimationFrame(rafId)
              rafId = 0
            }
          } else if (!isStatic && !rafId && !disposed) {
            lastT = 0
            rafId = requestAnimationFrame(loop)
          }
        },
        { signal },
      )
    }

    /* ---------- boot ---------- */
    function boot() {
      resizeCanvas()
      buildParticles()
      collectClearZones()
      setupChapters()
      setupNav()
      setupPointer()
      setupResize()
      setupVisibility()
      setupHeader()

      if (document.fonts?.ready) {
        document.fonts.ready.then(
          () => {
            fontsReady = true
          },
          () => {
            fontsReady = true
          },
        )
      } else {
        fontsReady = true
      }

      if (isStatic) {
        renderStatic()
        window.__READY__ = true
        return
      }

      const warm = performance.now()
      for (let i = 0; i < 42; i += 1) {
        step(1, warm + i * 16)
        drawFrame(warm + i * 16)
      }
      lastScrollY = window.scrollY || 0
      lastT = 0
      addImpulse(W * 0.7, H * 0.38, 36, 1100)
      window.__READY__ = true
      rafId = requestAnimationFrame(loop)
      later(() => {
        if (!disposed) addImpulse(W * 0.3, H * 0.64, 22, 900)
      }, 850)
    }

    boot()

    return () => {
      disposed = true
      controller.abort()
      if (rafId) cancelAnimationFrame(rafId)
      chaptersObserver?.disconnect()
      window.clearTimeout(resizeTimer)
      timeoutIds.forEach((id) => window.clearTimeout(id))
      wipeAnimations.forEach((animation) => animation.cancel())
      rootEl.classList.remove('no-motion')
      document.querySelector<HTMLElement>('.site-header')?.classList.remove('is-hidden')
      window.__READY__ = false
    }
  }, [])

  return (
    <>
      <canvas id="field" ref={canvasRef} aria-hidden="true" />
      <div className="wipe" id="wipe" ref={wipeRef} aria-hidden="true" />
    </>
  )
}
