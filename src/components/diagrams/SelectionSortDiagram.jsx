import { useMemo } from 'react'
import { useStepPlayer } from './shared/useStepPlayer'
import DiagramFrame from './shared/DiagramFrame'

const INITIAL = [3, 2, 8, 1, 5]

function computeSteps(initial) {
  const arr = [...initial]
  const n = arr.length
  const steps = [{ array: [...arr], sortedUpTo: -1, scan: -1, min: -1, note: 'Исходный массив' }]

  for (let i = 0; i < n - 1; i++) {
    let min = i
    steps.push({
      array: [...arr],
      sortedUpTo: i - 1,
      scan: i,
      min,
      note: `Ищем минимум в оставшейся части, начиная с ${arr[i]}`,
    })
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        sortedUpTo: i - 1,
        scan: j,
        min,
        note: `Сравниваем ${arr[j]} с текущим минимумом ${arr[min]}`,
      })
      if (arr[j] < arr[min]) {
        min = j
        steps.push({
          array: [...arr],
          sortedUpTo: i - 1,
          scan: j,
          min,
          note: `Новый минимум: ${arr[min]}`,
        })
      }
    }
    if (min !== i) {
      ;[arr[i], arr[min]] = [arr[min], arr[i]]
      steps.push({
        array: [...arr],
        sortedUpTo: i,
        scan: -1,
        min: -1,
        note: `Меняем местами с позицией ${i} — минимум встал на своё место`,
      })
    } else {
      steps.push({
        array: [...arr],
        sortedUpTo: i,
        scan: -1,
        min: -1,
        note: `Элемент ${arr[i]} уже стоит на своём месте`,
      })
    }
  }

  steps.push({ array: [...arr], sortedUpTo: n - 1, scan: -1, min: -1, note: 'Массив отсортирован' })
  return steps
}

export default function SelectionSortDiagram() {
  const steps = useMemo(() => computeSteps(INITIAL), [])
  const player = useStepPlayer(steps)
  const { step } = player
  const maxValue = Math.max(...INITIAL)

  return (
    <DiagramFrame player={player} note={step.note}>
      <div className="flex h-40 items-end justify-center gap-3">
        {step.array.map((value, i) => {
          const isSorted = i <= step.sortedUpTo
          const isMin = i === step.min
          const isScan = i === step.scan
          return (
            <div key={i} className="flex h-full w-12 flex-col items-center justify-end gap-1">
              <div
                className={`flex w-12 items-start justify-center rounded-t-md pt-1 text-sm font-semibold text-white transition-all duration-300 ${
                  isSorted
                    ? 'bg-emerald-500'
                    : isMin
                      ? 'bg-sky-500'
                      : isScan
                        ? 'bg-amber-500'
                        : 'bg-violet-500'
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
