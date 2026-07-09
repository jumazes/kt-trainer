import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'

export default function Timer({ running = true, totalMinutes, onTimeUp }) {
  const [seconds, setSeconds] = useState(0)
  const firedRef = useRef(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const hasCountdown = typeof totalMinutes === 'number' && totalMinutes > 0
  const totalSeconds = hasCountdown ? totalMinutes * 60 : null
  const remaining = hasCountdown ? Math.max(totalSeconds - seconds, 0) : seconds
  const isLow = hasCountdown && remaining <= 300

  useEffect(() => {
    if (hasCountdown && remaining === 0 && !firedRef.current) {
      firedRef.current = true
      onTimeUp?.()
    }
  }, [hasCountdown, remaining, onTimeUp])

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
  const secs = String(remaining % 60).padStart(2, '0')

  return (
    <div
      className={`flex items-center gap-1.5 text-sm font-medium ${
        isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
      }`}
    >
      <Clock className="h-4 w-4" />
      <span className="tabular-nums">
        {minutes}:{secs}
      </span>
      {hasCountdown && <span className="text-xs text-slate-400 dark:text-slate-500">осталось</span>}
    </div>
  )
}
