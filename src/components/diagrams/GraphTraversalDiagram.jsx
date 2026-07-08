import { useMemo } from 'react'
import { useStepPlayer } from './shared/useStepPlayer'
import DiagramFrame from './shared/DiagramFrame'

const NODES = {
  A: { x: 60, y: 30 },
  B: { x: 220, y: 30 },
  C: { x: 60, y: 120 },
  D: { x: 220, y: 120 },
  E: { x: 140, y: 200 },
  F: { x: 300, y: 200 },
}
const ADJ = {
  A: ['B', 'C'],
  B: ['A', 'D'],
  C: ['A', 'D', 'E'],
  D: ['B', 'C', 'F'],
  E: ['C', 'F'],
  F: ['D', 'E'],
}
const EDGES = [
  ['A', 'B'],
  ['A', 'C'],
  ['B', 'D'],
  ['C', 'D'],
  ['C', 'E'],
  ['D', 'F'],
  ['E', 'F'],
]
const START = 'A'

function computeBfsSteps(start) {
  const visited = new Set([start])
  const queue = [start]
  const steps = [
    { visited: new Set(visited), queue: [...queue], current: null, edge: null, note: `Начинаем с ${start}, кладём в очередь` },
  ]

  while (queue.length) {
    const node = queue.shift()
    steps.push({ visited: new Set(visited), queue: [...queue], current: node, edge: null, note: `Достаём из очереди узел ${node}` })
    for (const nb of ADJ[node]) {
      if (!visited.has(nb)) {
        visited.add(nb)
        queue.push(nb)
        steps.push({
          visited: new Set(visited),
          queue: [...queue],
          current: node,
          edge: [node, nb],
          note: `${node} → ${nb}: новый узел, добавляем в очередь`,
        })
      }
    }
  }
  steps.push({ visited: new Set(visited), queue: [], current: null, edge: null, note: 'Обход в ширину завершён' })
  return steps
}

function computeDfsSteps(start) {
  const visited = new Set()
  const steps = [{ visited: new Set(), path: [], current: null, edge: null, note: `Начинаем с ${start}` }]

  function visit(node, from, path) {
    visited.add(node)
    const newPath = [...path, node]
    steps.push({
      visited: new Set(visited),
      path: newPath,
      current: node,
      edge: from ? [from, node] : null,
      note: from ? `${from} → ${node}: заходим вглубь` : `Посещаем ${node}`,
    })
    for (const nb of ADJ[node]) {
      if (!visited.has(nb)) visit(nb, node, newPath)
    }
  }
  visit(start, null, [])
  steps.push({ visited: new Set(visited), path: [], current: null, edge: null, note: 'Обход в глубину завершён' })
  return steps
}

export default function GraphTraversalDiagram({ mode }) {
  const steps = useMemo(() => (mode === 'bfs' ? computeBfsSteps(START) : computeDfsSteps(START)), [mode])
  const player = useStepPlayer(steps, 900)
  const { step } = player

  const isActiveEdge = (a, b) =>
    step.edge && ((step.edge[0] === a && step.edge[1] === b) || (step.edge[0] === b && step.edge[1] === a))

  const trace = mode === 'bfs' ? step.queue : step.path

  return (
    <DiagramFrame player={player} note={step.note}>
      <div className="flex flex-col items-center gap-3">
        <svg width="360" height="230" className="max-w-full">
          {EDGES.map(([a, b]) => {
            const active = isActiveEdge(a, b)
            return (
              <line
                key={`${a}-${b}`}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                className={active ? 'stroke-amber-500' : 'stroke-slate-300 dark:stroke-slate-700'}
                strokeWidth={active ? 3 : 2}
              />
            )
          })}
          {Object.entries(NODES).map(([name, p]) => {
            const isVisited = step.visited.has(name)
            const isCurrent = step.current === name
            return (
              <g key={name}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="18"
                  className={`transition-all duration-300 ${
                    isCurrent ? 'fill-amber-500' : isVisited ? 'fill-emerald-500' : 'fill-violet-500'
                  }`}
                />
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white text-xs font-semibold"
                >
                  {name}
                </text>
              </g>
            )
          })}
        </svg>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mode === 'bfs' ? 'Очередь' : 'Путь от старта'}: {trace?.length ? trace.join(mode === 'bfs' ? ', ' : ' → ') : '—'}
        </p>
      </div>
    </DiagramFrame>
  )
}
