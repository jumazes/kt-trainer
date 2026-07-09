import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, PlayCircle, BookOpen } from 'lucide-react'
import { getSubject, getHistory } from '../api/client'
import { usePlayerName } from '../hooks/usePlayerName'

export default function SubjectDetail() {
  const { subjectId } = useParams()
  const [playerName] = usePlayerName()
  const [subject, setSubject] = useState(null)
  const [bestScore, setBestScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    Promise.all([getSubject(subjectId), playerName ? getHistory(playerName) : Promise.resolve([])])
      .then(([subjectData, history]) => {
        setSubject(subjectData)
        const attempts = history.filter((h) => h.subjectId === subjectId)
        setBestScore(attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [subjectId, playerName])

  if (loading) {
    return <p className="text-slate-500 dark:text-slate-400">Загрузка...</p>
  }

  if (notFound || !subject) {
    return (
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-300">Раздел не найден.</p>
        <Link to="/" className="mt-4 inline-block text-violet-600 hover:underline dark:text-violet-400">
          Вернуться на главную
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/"
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Все разделы
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {subject.title}
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{subject.description}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>{subject.format.totalQuestions} вопросов в тесте</span>
          <span>{subject.format.totalMinutes} минут</span>
          <span>
            {subject.format.selection === 'multiple'
              ? 'Один или несколько верных ответов'
              : `Один верный из ${subject.format.optionsCount}`}
          </span>
          <span>{subject.topics.length} тем в программе</span>
          {bestScore != null && <span>Лучший результат: {bestScore}%</span>}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to={`/learn/${subject.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-violet-700 active:scale-[0.97]"
          >
            <BookOpen className="h-4 w-4" />
            Изучить материалы
          </Link>
          <Link
            to={`/quiz/${subject.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.97] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <PlayCircle className="h-4 w-4" />
            Начать тест
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-medium text-slate-900 dark:text-slate-100">
          Темы программы
        </h2>
        <div className="flex flex-wrap gap-2">
          {subject.topics.map((topic) => (
            <Link
              key={topic}
              to={`/learn/${subject.id}?topic=${encodeURIComponent(topic)}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-500/50 dark:hover:text-violet-300"
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
