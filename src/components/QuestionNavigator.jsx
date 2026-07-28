const statusStyles = {
  empty:
    'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
  answered: 'bg-violet-600 text-white hover:bg-violet-700',
  correct: 'bg-emerald-500 text-white hover:bg-emerald-600',
  wrong: 'bg-rose-500 text-white hover:bg-rose-600',
}

export default function QuestionNavigator({ statuses, currentIndex, onJump }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((status, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onJump(i)}
          aria-label={`Вопрос ${i + 1}`}
          aria-current={i === currentIndex ? 'true' : undefined}
          className={`h-8 w-8 rounded-md text-xs font-medium transition-all duration-150 active:scale-95 ${
            statusStyles[status]
          } ${
            i === currentIndex
              ? 'ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-950'
              : ''
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}
