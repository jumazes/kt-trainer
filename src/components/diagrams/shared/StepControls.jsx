import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'

export default function StepControls({ player }) {
  const { playing, isFirst, isLast, reset, prev, next, toggle, index, total } = player

  return (
    <>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={reset}
          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="В начало"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={prev}
          disabled={isFirst}
          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Назад"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? 'Пауза' : 'Играть'}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={isLast}
          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Вперёд"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    </>
  )
}
