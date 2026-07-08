import { Link } from 'react-router-dom'
import { ArrowRight, ListChecks } from 'lucide-react'

const colorStyles = {
  sky: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20',
  emerald:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  amber:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  violet:
    'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20',
}

export default function SubjectCard({ subject, questionCount, bestScore }) {
  return (
    <Link
      to={`/subject/${subject.id}`}
      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${colorStyles[subject.color]}`}
        >
          <ListChecks className="h-3.5 w-3.5" />
          {questionCount} вопросов
        </span>
        <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {subject.title}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {subject.description}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {bestScore != null ? `Лучший результат: ${bestScore}%` : 'Ещё не пройдено'}
        </span>
        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
      </div>
    </Link>
  )
}
