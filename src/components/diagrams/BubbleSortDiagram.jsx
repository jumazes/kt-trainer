import { useMemo } from 'react'
import { useStepPlayer } from './shared/useStepPlayer'
import DiagramFrame from './shared/DiagramFrame'

const INITIAL = [3, 2, 8, 1, 5]

function computeSteps(initial) {
  const arr = [...initial]
  const n = arr.length
  const steps = [{ array: [...arr], compare: [], sortedFrom: n, note: 'Исходный массив' }]

  for (let round = 0; round < n - 1; round++) {
    let swappedInRound = false
    for (let i = 0; i < n - 1 - round; i++) {
      steps.push({
        array: [...arr],
        compare: [i, i + 1],
        sortedFrom: n - round,
        note: `Сравниваем ${arr[i]} и ${arr[i + 1]}`,
      })
      if (arr[i] > arr[i + 1]) {
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        swappedInRound = true
        steps.push({
          array: [...arr],
          compare: [i, i + 1],
          sortedFrom: n - round,
          note: `${arr[i + 1]} > ${arr[i]} — меняем местами`,
        })
      }
    }
    steps.push({
      array: [...arr],
      compare: [],
      sortedFrom: n - round - 1,
      note: `Проход ${round + 1} завершён — самый большой элемент "всплыл" в конец`,
    })
    if (!swappedInRound) break
  }

  steps.push({ array: [...arr], compare: [], sortedFrom: 0, note: 'Массив отсортирован' })
  return steps
}

export default function BubbleSortDiagram() {
  const steps = useMemo(() => computeSteps(INITIAL), [])
  const player = useStepPlayer(steps)
  const { step } = player
  const maxValue = Math.max(...INITIAL)

  return (
    <DiagramFrame player={player} note={step.note}>
      <div className="flex h-40 items-end justify-center gap-3">
        {step.array.map((value, i) => {
          const isComparing = step.compare.includes(i)
          const isSorted = i >= step.sortedFrom
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
