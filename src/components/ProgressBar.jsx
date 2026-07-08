export default function ProgressBar({ current, total }) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Вопрос {current} из {total}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-violet-600 transition-all duration-300 dark:bg-violet-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
