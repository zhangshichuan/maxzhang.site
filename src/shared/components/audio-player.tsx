/**
 * 语音播报组件
 *
 * 中文文章 → xiaoxiao.mp3，英文文章 → jenny.mp3
 */

'use client'

import { cn } from '@/src/shared/utils'
import { Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface AudioPlayerProps {
  slug: string
  lang: string
  className?: string
}

export function AudioPlayer({ slug, lang, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)
  const [show, setShow] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const durationSet = useRef(false)

  const voice = lang === 'zh' ? 'xiaoxiao' : 'jenny'

  const handleError = useCallback(() => setShow(false), [])
  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.duration && isFinite(audio.duration)) {
      durationSet.current = true
      setDuration(audio.duration)
    }
  }, [])

  // 兜底：有些 MP3 不触发 onLoadedMetadata，在首次 timeupdate 或 canplay 时捕获时长
  const handleCanPlay = useCallback(() => {
    const audio = audioRef.current
    if (audio && !durationSet.current && audio.duration && isFinite(audio.duration)) {
      durationSet.current = true
      setDuration(audio.duration)
    }
  }, [])
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
    if (!durationSet.current && audio.duration && isFinite(audio.duration)) {
      durationSet.current = true
      setDuration(audio.duration)
    }
  }, [])
  const handleEnded = useCallback(() => setIsPlaying(false), [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.playbackRate = rate
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [rate])

  const handleRateChange = useCallback((newRate: number) => {
    setRate(newRate)
    if (audioRef.current) audioRef.current.playbackRate = newRate
  }, [])

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration || 0))
    }
  }, [])

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (!show) return null

  return (
    <div className={cn('inline-flex flex-wrap items-center gap-2 font-sans', className)}>
      <button
        onClick={togglePlay}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-border/40 px-3 py-1.5 text-sm font-medium tracking-wide transition-all',
          isPlaying
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'bg-card text-muted-foreground hover:border-primary/20 hover:text-primary',
        )}
      >
        {isPlaying ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
        <span className="hidden sm:inline">{isPlaying ? '暂停' : '收听'}</span>
      </button>

      {duration > 0 && (
        <div className="inline-flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const t = parseFloat(e.target.value)
              setCurrentTime(t)
              if (audioRef.current) audioRef.current.currentTime = t
            }}
            className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-border [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
          <span className="font-mono text-xs text-muted-foreground tabular-nums">{formatTime(duration)}</span>
        </div>
      )}

      <div className="hidden items-center gap-0.5 sm:inline-flex">
        <button
          onClick={() => skip(-10)}
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
          title="后退10秒"
        >
          <SkipBack className="size-3.5" />
        </button>
        <button
          onClick={() => skip(10)}
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
          title="前进10秒"
        >
          <SkipForward className="size-3.5" />
        </button>
      </div>

      <select
        value={rate}
        onChange={(e) => handleRateChange(parseFloat(e.target.value))}
        className="rounded-sm border border-border/40 bg-card px-1 py-1 text-[10px] text-muted-foreground outline-none"
      >
        <option value={0.75}>0.75x</option>
        <option value={1}>1x</option>
        <option value={1.25}>1.25x</option>
        <option value={1.5}>1.5x</option>
        <option value={2}>2x</option>
      </select>

      <audio
        ref={audioRef}
        src={`/audio/${slug}/${voice}.mp3`}
        preload="metadata"
        onError={handleError}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  )
}
