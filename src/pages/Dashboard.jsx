import { useEffect, useState } from 'react'
import { UserPlus, WifiOff } from 'lucide-react'
import { getSubjects, getHistory } from '../api/client'
import { usePlayerName } from '../hooks/usePlayerName'
import SubjectCard from '../components/SubjectCard'

export default function Dashboard() {
  const [subjects, setSubjects] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [playerName] = usePlayerName()

  useEffect(() => {
    setLoading(true)
    setError(false)
    Promise.all([getSubjects(), playerName ? getHistory(playerName) : Promise.resolve([])])
      .then(([subjectsData, historyData]) => {
        setSubjects(subjectsData)
        setHistory(historyData)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [playerName])

  const bestScoreFor = (subjectId) => {
    const attempts = history.filter((h) => h.subjectId === subjectId)
    if (attempts.length === 0) return null
    return Math.max(...attempts.map((a) => a.percent))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Подготовка к КТ в магистратуру
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Выберите раздел, чтобы начать тренировочный тест
        </p>
      </div>

      {!playerName && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200">
          <UserPlus className="h-4 w-4 shrink-0" />
          Укажите своё имя в правом верхнем углу, чтобы ваш прогресс не смешивался с прогрессом друзей.
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Загрузка...</p>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-rose-300 py-16 text-rose-500 dark:border-rose-500/40 dark:text-rose-400">
          <WifiOff className="h-8 w-8" />
          <p>Не удалось загрузить данные. Проверьте соединение и обновите страницу.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              questionCount={subject.format.totalQuestions}
              bestScore={bestScoreFor(subject.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
