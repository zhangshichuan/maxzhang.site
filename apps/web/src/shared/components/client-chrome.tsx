'use client'

import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

/**
 * Global chrome: skip link, side rail, custom cursor, scroll progress,
 * and a cobalt route veil that replays on every navigation.
 */
export function ClientChrome() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [veil, setVeil] = useState(0)
  const [veilOn, setVeilOn] = useState(false)
  const previous = useRef(pathname)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)

  // route veil
  useEffect(() => {
    if (previous.current === pathname) return
    previous.current = pathname
    setVeil((value) => value + 1)
    setVeilOn(true)
    const timer = window.setTimeout(() => setVeilOn(false), 820)
    return () => window.clearTimeout(timer)
  }, [pathname])

  // scroll progress
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progressRef.current?.style.setProperty('--p', String(value))
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // custom cursor
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    document.body.classList.add('zx-has-cursor')
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring || !label) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let tx = x
    let ty = y
    let frame = 0
    let hovered = false

    const onMove = (event: PointerEvent) => {
      tx = event.clientX
      ty = event.clientY
    }
    const setTarget = (event: Event) => {
      const target = event.target as HTMLElement | null
      const el = target?.closest<HTMLElement>('a, button, [data-cursor]')
      if (!el) return
      hovered = true
      ring.classList.add('is-hot')
      label.textContent = el.dataset.cursorLabel || (el.tagName === 'A' ? '↗' : 'View')
      label.classList.add('is-on')
    }
    const clearTarget = () => {
      hovered = false
      ring.classList.remove('is-hot')
      label.classList.remove('is-on')
    }

    const loop = () => {
      x += (tx - x) * 0.24
      y += (ty - y) * 0.24
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      label.style.transform = `translate3d(${x + 18}px, ${y + 18}px, 0)`
      if (hovered) label.classList.add('is-on')
      frame = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', setTarget, { passive: true })
    document.addEventListener('pointerout', clearTarget, { passive: true })
    frame = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', setTarget)
      document.removeEventListener('pointerout', clearTarget)
      cancelAnimationFrame(frame)
      document.body.classList.remove('zx-has-cursor')
    }
  }, [])

  return (
    <>
      <a className="zx-skip" href="#site-main">
        Skip to content
      </a>
      <div className="zx-progress" ref={progressRef} aria-hidden="true" />
      <div className="zx-rail" aria-hidden="true">
        <span>AI Product Manager</span>
        <i />
        <span>Portfolio — 2026</span>
      </div>
      <div className="zx-cursor" ref={dotRef} aria-hidden="true" />
      <div className="zx-cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="zx-cursor-label" ref={labelRef} aria-hidden="true" />
      <div key={veil} className={`zx-veil${veilOn ? ' is-active' : ''}`} aria-hidden="true" />
    </>
  )
}
