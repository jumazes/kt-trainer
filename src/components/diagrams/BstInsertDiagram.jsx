import { useMemo } from 'react'
import { useStepPlayer } from './shared/useStepPlayer'
import DiagramFrame from './shared/DiagramFrame'

const KEYS = [8, 3, 10, 1, 6, 14, 4, 7]

function computeSteps(keys) {
  const sorted = [...keys].sort((a, b) => a - b)
  const rank = new Map(sorted.map((v, i) => [v, i]))
  const childOf = new Map()
  const nodes = new Map()
  let root = null
  const steps = [{ nodes: new Map(nodes), newValue: null, note: 'Пустое дерево' }]

  for (const value of keys) {
    if (root === null) {
      root = value
      nodes.set(value, { value, depth: 0, parent: null, x: rank.get(value) })
      childOf.set(value, { left: null, right: null })
      steps.push({ nodes: new Map(nodes), newValue: value, note: `Вставляем ${value} — становится корнем дерева` })
      continue
    }

    let cur = root
    let depth = 0
    const comparisons = []
    while (true) {
      if (value < cur) {
        comparisons.push(`${value} < ${cur}`)
        const kids = childOf.get(cur)
        if (kids.left == null) {
          kids.left = value
          nodes.set(value, { value, depth: depth + 1, parent: cur, x: rank.get(value) })
          childOf.set(value, { left: null, right: null })
          break
        }
        cur = kids.left
      } else {
        comparisons.push(`${value} > ${cur}`)
        const kids = childOf.get(cur)
        if (kids.right == null) {
          kids.right = value
          nodes.set(value, { value, depth: depth + 1, parent: cur, x: rank.get(value) })
          childOf.set(value, { left: null, right: null })
          break
        }
        cur = kids.right
      }
      depth++
    }
    steps.push({ nodes: new Map(nodes), newValue: value, note: `Вставляем ${value} (${comparisons.join(', ')})` })
  }

  steps.push({ nodes: new Map(nodes), newValue: null, note: 'Дерево построено' })
  return steps
}

const X_SPACING = 52
const Y_SPACING = 56

export default function BstInsertDiagram() {
  const steps = useMemo(() => computeSteps(KEYS), [])
  const player = useStepPlayer(steps, 900)
  const { step } = player

  const n = KEYS.length
  const width = n * X_SPACING
  const nodesArr = Array.from(step.nodes.values())
  const maxDepth = nodesArr.reduce((m, nd) => Math.max(m, nd.depth), 0)
  const height = (maxDepth + 1) * Y_SPACING + 20

  const pos = (nd) => ({ cx: nd.x * X_SPACING + X_SPACING / 2, cy: nd.depth * Y_SPACING + 24 })

  return (
    <DiagramFrame player={player} note={step.note}>
      <div className="flex justify-center overflow-x-auto">
        <svg width={width} height={height} className="max-w-full">
          {nodesArr.map((nd) => {
            if (nd.parent == null) return null
            const parentNode = step.nodes.get(nd.parent)
            const a = pos(nd)
            const b = pos(parentNode)
            return (
              <line
                key={`edge-${nd.value}`}
                x1={a.cx}
                y1={a.cy}
                x2={b.cx}
                y2={b.cy}
                className="stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="2"
              />
            )
          })}
          {nodesArr.map((nd) => {
            const { cx, cy } = pos(nd)
            const isNew = nd.value === step.newValue
            return (
              <g key={nd.value}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="16"
                  className={`transition-all duration-300 ${isNew ? 'fill-amber-500' : 'fill-violet-500'}`}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white text-xs font-semibold"
                >
                  {nd.value}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </DiagramFrame>
  )
}
