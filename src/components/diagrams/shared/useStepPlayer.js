import { useEffect, useState } from 'react'

export function useStepPlayer(steps, delay = 800) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    if (index >= steps.length - 1) {
      setPlaying(false)
      return
    }
    const id = setTimeout(() => setIndex((i) => i + 1), delay)
    return () => clearTimeout(id)
  }, [playing, index, steps.length, delay])

  return {
    step: steps[index],
    index,
    total: steps.length,
    playing,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    reset: () => {
      setIndex(0)
      setPlaying(false)
    },
    prev: () => {
      setPlaying(false)
      setIndex((i) => Math.max(0, i - 1))
    },
    next: () => {
      setPlaying(false)
      setIndex((i) => Math.min(steps.length - 1, i + 1))
    },
    toggle: () => setPlaying((p) => !p),
  }
}
