import { useMemo } from 'react'
import { useStepPlayer } from './shared/useStepPlayer'
import DiagramFrame from './shared/DiagramFrame'

const KEYS = [10, 15, 3, 8, 20]
const SIZE = 5

function computeSteps(keys, size) {
  const buckets = Array.from({ length: size }, () => [])
  const steps = [
    {
      buckets: buckets.map((b) => [...b]),
      active: -1,
      note: `Таблица из ${size} корзин, хеш-функция: key % ${size}`,
    },
  ]

  for (const key of keys) {
    const idx = key % size
    const collided = buckets[idx].length > 0
    buckets[idx].push(key)
    steps.push({
      buckets: buckets.map((b) => [...b]),
      active: idx,
      note: collided
        ? `${key} % ${size} = ${idx} — корзина занята, добавляем в цепочку (коллизия)`
        : `${key} % ${size} = ${idx} — корзина свободна`,
    })
  }
  return steps
}

export default function HashChainingDiagram() {
  const steps = useMemo(() => computeSteps(KEYS, SIZE), [])
  const player = useStepPlayer(steps, 900)
  const { step } = player

  return (
    <DiagramFrame player={player} note={step.note}>
      <div className="flex flex-col gap-2">
        {step.buckets.map((chain, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white transition-colors duration-300 ${
                idx === step.active ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'
              }`}
            >
              {idx}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {chain.length === 0 ? (
                <span className="text-xs text-slate-400 dark:text-slate-500">пусто</span>
              ) : (
                chain.map((key, chainIdx) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white transition-colors duration-300 ${
                        idx === step.active && chainIdx === chain.length - 1
                          ? 'bg-emerald-500'
                          : 'bg-violet-500'
                      }`}
                    >
                      {key}
                    </div>
                    {chainIdx < chain.length - 1 && (
                      <span className="text-slate-300 dark:text-slate-600">→</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </DiagramFrame>
  )
}
