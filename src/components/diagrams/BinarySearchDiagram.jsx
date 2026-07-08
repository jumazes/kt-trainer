import { useMemo } from 'react'
import { useStepPlayer } from './shared/useStepPlayer'
import DiagramFrame from './shared/DiagramFrame'

const ARRAY = [1, 3, 5, 7, 9, 11, 13]
const TARGET = 13

function computeSteps(arr, target) {
  const n = arr.length
  const steps = [{ lo: 0, hi: n - 1, mid: -1, found: -1, note: `Ищем значение ${target} в отсортированном массиве` }]
  let lo = 0
  let hi = n - 1

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    steps.push({ lo, hi, mid, found: -1, note: `Средний элемент: arr[${mid}] = ${arr[mid]}` })
    if (arr[mid] === target) {
      steps.push({ lo, hi, mid, found: mid, note: `Нашли! ${arr[mid]} = ${target}` })
      return steps
    } else if (arr[mid] < target) {
      lo = mid + 1
      steps.push({ lo, hi, mid: -1, found: -1, note: `${arr[mid]} < ${target} — ищем в правой половине` })
    } else {
      hi = mid - 1
      steps.push({ lo, hi, mid: -1, found: -1, note: `${arr[mid]} > ${target} — ищем в левой половине` })
    }
  }
  steps.push({ lo, hi, mid: -1, found: -1, note: 'Элемент не найден' })
  return steps
}

export default function BinarySearchDiagram() {
  const steps = useMemo(() => computeSteps(ARRAY, TARGET), [])
  const player = useStepPlayer(steps, 900)
  const { step } = player

  return (
    <DiagramFrame player={player} note={step.note}>
      <div className="flex items-end justify-center gap-2">
        {ARRAY.map((value, idx) => {
          const outOfRange = idx < step.lo || idx > step.hi
          const isMid = idx === step.mid
          const isFound = idx === step.found
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-12 w-10 items-center justify-center rounded-md text-sm font-semibold text-white transition-all duration-300 ${
                  isFound
                    ? 'bg-emerald-500'
                    : isMid
                      ? 'bg-amber-500'
                      : outOfRange
                        ? 'bg-slate-300 dark:bg-slate-700'
                        : 'bg-violet-500'
                }`}
              >
                {value}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{idx}</span>
            </div>
          )
        })}
      </div>
    </DiagramFrame>
  )
}
