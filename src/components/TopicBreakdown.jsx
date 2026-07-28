function barColor(percent) {
  if (percent < 50) return 'bg-rose-500'
  if (percent < 80) return 'bg-amber-500'
  return 'bg-emerald-500'
}

// Weakest groups first — that ordering is the whole point of showing this.
export default function TopicBreakdown({ rows }) {
  const sorted = [...rows].sort((a, b) => a.earned / a.max - b.earned / b.max)

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((row) => {
        const percent = row.max === 0 ? 0 : Math.round((row.earned / row.max) * 100)
        return (
          <div key={row.id ?? row.title}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-slate-700 dark:text-slate-300">{row.title}</span>
              <span className="shrink-0 tabular-nums text-xs text-slate-500 dark:text-slate-400">
                {row.earned} / {row.max} · {percent}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(percent)}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
