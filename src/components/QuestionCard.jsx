import { Check, X, Circle, CheckSquare, Square, Dot } from 'lucide-react'

export default function QuestionCard({ question, selected, onSelect, showResult, multiple }) {
  const selectedSet = new Set(selected)
  const correctSet = new Set(question.correct)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {question.topic && (
          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {question.topic}
          </span>
        )}
        {multiple && (
          <span className="inline-block rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            Выберите один или несколько верных ответов
          </span>
        )}
      </div>
      <h3 className="whitespace-pre-line text-lg font-medium text-slate-900 dark:text-slate-100">
        {question.text}
      </h3>
      <div className="mt-4 flex flex-col gap-2">
        {question.options.map((option, index) => {
          const isSelected = selectedSet.has(index)
          const isCorrect = correctSet.has(index)
          let stateStyles =
            'border-slate-200 hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/10'

          if (showResult) {
            if (isCorrect) {
              stateStyles =
                'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
            } else if (isSelected && !isCorrect) {
              stateStyles =
                'border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10'
            }
          } else if (isSelected) {
            stateStyles =
              'border-violet-400 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-500/10'
          }

          const SelectIcon = multiple
            ? isSelected
              ? CheckSquare
              : Square
            : isSelected
              ? Dot
              : Circle

          return (
            <button
              key={index}
              type="button"
              disabled={showResult}
              onClick={() => onSelect(index)}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${stateStyles}`}
            >
              <span className="flex items-center gap-2">
                <SelectIcon
                  className={`h-4 w-4 shrink-0 ${isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}
                />
                {option}
              </span>
              {showResult && isCorrect && (
                <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              {showResult && isSelected && !isCorrect && (
                <X className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
            </button>
          )
        })}
      </div>
      {showResult && question.explanation && (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          {question.explanation}
        </p>
      )}
    </div>
  )
}
