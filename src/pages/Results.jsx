import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Trophy, RotateCcw, Home } from 'lucide-react'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const attempt = location.state
  const [displayPercent, setDisplayPercent] = useState(0)

  useEffect(() => {
    if (attempt?.percent == null) return
    const target = attempt.percent
    const duration = 700
    const start = performance.now()
    let raf

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - t) ** 3
      setDisplayPercent(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [attempt?.percent])

  if (!attempt) {
    return (
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-300">Нет данных о результате.</p>
        <Link to="/" className="mt-4 inline-block text-violet-600 hover:underline dark:text-violet-400">
          Вернуться на главную
        </Link>
      </div>
    )
  }

  const { subjectId, subjectTitle, totalQuestions, pointsEarned, maxPoints } = attempt

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="inline-flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20">
        <Trophy className="h-8 w-8 text-violet-600 dark:text-violet-400" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {subjectTitle}
      </h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Тест завершён</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-4xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
          {displayPercent}%
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Баллов: {pointsEarned} из {maxPoints} ({totalQuestions} вопросов)
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/quiz/${subjectId}`, { replace: true })}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.97] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Пройти снова
        </button>
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-violet-700 active:scale-[0.97]"
        >
          <Home className="h-4 w-4" />
          На главную
        </Link>
      </div>
    </div>
  )
}
