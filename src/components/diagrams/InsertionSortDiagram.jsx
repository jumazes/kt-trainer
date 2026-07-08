import { useMemo } from 'react'
import { useStepPlayer } from './shared/useStepPlayer'
import DiagramFrame from './shared/DiagramFrame'

const INITIAL = [3, 2, 8, 1, 5]

function computeSteps(initial) {
  const arr = [...initial]
  const n = arr.length
  const steps = [
    { array: [...arr], compare: [], sortedUpTo: 0, note: 'Исходный массив (первый элемент считаем отсортированным)' },
  ]

  for (let i = 1; i < n; i++) {
    let j = i
    steps.push({
      array: [...arr],
      compare: [j - 1, j],
      sortedUpTo: i - 1,
      note: `Берём элемент ${arr[j]} и сравниваем с левым соседом ${arr[j - 1]}`,
    })
    while (j > 0 && arr[j - 1] > arr[j]) {
      ;[arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]
      j--
      steps.push({
        array: [...arr],
        compare: j > 0 ? [j - 1, j] : [],
        sortedUpTo: i - 1,
        note:
          j > 0
            ? `Меняем местами, сравниваем дальше с ${arr[j - 1]}`
            : `Меняем местами — элемент дошёл до начала массива`,
      })
    }
    steps.push({
      array: [...arr],
      compare: [],
      sortedUpTo: i,
      note: `Элементы с 0 по ${i} отсортированы`,
    })
  }

  steps.push({ array: [...arr], compare: [], sortedUpTo: n - 1, note: 'Массив отсортирован' })
  return steps
}

export default function InsertionSortDiagram() {
  const steps = useMemo(() => computeSteps(INITIAL), [])
  const player = useStepPlayer(steps)
  const { step } = player
  const maxValue = Math.max(...INITIAL)

  return (
    <DiagramFrame player={player} note={step.note}>
      <div className="flex h-40 items-end justify-center gap-3">
        {step.array.map((value, i) => {
          const isComparing = step.compare.includes(i)
          const isSorted = i <= step.sortedUpTo
          return (
            <div key={i} className="flex h-full w-12 flex-col items-center justify-end gap-1">
              <div
                className={`flex w-12 items-start justify-center rounded-t-md pt-1 text-sm font-semibold text-white transition-all duration-300 ${
                  isSorted ? 'bg-emerald-500' : isComparing ? 'bg-amber-500' : 'bg-violet-500'
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
