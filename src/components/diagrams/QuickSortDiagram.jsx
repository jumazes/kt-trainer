import { useMemo } from 'react'
import { useStepPlayer } from './shared/useStepPlayer'
import DiagramFrame from './shared/DiagramFrame'

const INITIAL = [3, 2, 8, 1, 5]

function computeSteps(initial) {
  const arr = [...initial]
  const n = arr.length
  const locked = new Set()
  const steps = [
    { array: [...arr], lo: 0, hi: n - 1, i: -1, j: -1, pivotIdx: -1, locked: new Set(), note: 'Исходный массив' },
  ]

  function partition(lo, hi) {
    const pivot = arr[hi]
    steps.push({
      array: [...arr],
      lo,
      hi,
      i: lo - 1,
      j: -1,
      pivotIdx: hi,
      locked: new Set(locked),
      note: `Выбираем опорный элемент (pivot) = ${pivot}`,
    })
    let i = lo - 1
    for (let j = lo; j < hi; j++) {
      steps.push({
        array: [...arr],
        lo,
        hi,
        i,
        j,
        pivotIdx: hi,
        locked: new Set(locked),
        note: `Сравниваем ${arr[j]} с pivot ${pivot}`,
      })
      if (arr[j] < pivot) {
        i++
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push({
            array: [...arr],
            lo,
            hi,
            i,
            j,
            pivotIdx: hi,
            locked: new Set(locked),
            note: `${arr[i]} < pivot — меняем местами`,
          })
        }
      }
    }
    ;[arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]]
    locked.add(i + 1)
    steps.push({
      array: [...arr],
      lo,
      hi,
      i: i + 1,
      j: -1,
      pivotIdx: i + 1,
      locked: new Set(locked),
      note: `Pivot ${arr[i + 1]} встал на своё окончательное место`,
    })
    return i + 1
  }

  function quickSort(lo, hi) {
    if (lo >= hi) {
      if (lo === hi) locked.add(lo)
      return
    }
    const p = partition(lo, hi)
    quickSort(lo, p - 1)
    quickSort(p + 1, hi)
  }

  quickSort(0, n - 1)
  steps.push({
    array: [...arr],
    lo: 0,
    hi: -1,
    i: -1,
    j: -1,
    pivotIdx: -1,
    locked: new Set(arr.map((_, idx) => idx)),
    note: 'Массив отсортирован',
  })
  return steps
}

export default function QuickSortDiagram() {
  const steps = useMemo(() => computeSteps(INITIAL), [])
  const player = useStepPlayer(steps, 900)
  const { step } = player
  const maxValue = Math.max(...INITIAL)

  return (
    <DiagramFrame player={player} note={step.note}>
      <div className="flex h-40 items-end justify-center gap-3">
        {step.array.map((value, idx) => {
          const inRange = idx >= step.lo && idx <= step.hi
          const isLocked = step.locked.has(idx)
          const isPivot = idx === step.pivotIdx && !isLocked
          const isI = idx === step.i && !isPivot && !isLocked
          const isJ = idx === step.j && !isPivot && !isLocked
          return (
            <div key={idx} className="flex h-full w-12 flex-col items-center justify-end gap-1">
              <div
                className={`flex w-12 items-start justify-center rounded-t-md pt-1 text-sm font-semibold text-white transition-all duration-300 ${
                  isLocked
                    ? 'bg-emerald-500'
                    : isPivot
                      ? 'bg-rose-500'
                      : isJ
                        ? 'bg-amber-500'
                        : isI
                          ? 'bg-sky-500'
                          : inRange
                            ? 'bg-violet-500'
                            : 'bg-slate-300 dark:bg-slate-700'
                }`}
                style={{ height: `${(value / maxValue) * 80 + 20}%` }}
              >
                {value}
              </div>
            </div>
          )
        })}
      </div>
    </DiagramFrame>
  )
}
