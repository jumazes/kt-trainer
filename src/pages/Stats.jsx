import { useEffect, useMemo, useState } from 'react'
import { Trash2, BarChart3, WifiOff } from 'lucide-react'
import { getHistory, clearHistory } from '../api/client'
import { usePlayerName } from '../hooks/usePlayerName'
import TopicBreakdown from '../components/TopicBreakdown'

const ALL = '__all__'

export default function Stats() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [playerName] = usePlayerName()
  const [filter, setFilter] = useState(playerName || ALL)

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const players = useMemo(() => {
    const names = new Set(history.map((h) => h.playerName))
    return [...names].sort()
  }, [history])

  const filtered = filter === ALL ? history : history.filter((h) => h.playerName === filter)

  // Sum every attempt's per-group results so weak topics show up across the
  // whole history rather than only in the last attempt.
  const breakdownBySubject = useMemo(() => {
    const subjects = new Map()
    for (const attempt of filtered) {
      if (!attempt.breakdown?.length) continue
      const entry = subjects.get(attempt.subjectId) ?? {
        title: attempt.subjectTitle,
        attempts: 0,
        groups: new Map(),
      }
      entry.attempts += 1
      for (const group of attempt.breakdown) {
        const totals = entry.groups.get(group.id) ?? { id: group.id, title: group.title, earned: 0, max: 0 }
        totals.earned += group.earned
        totals.max += group.max
        entry.groups.set(group.id, totals)
      }
      subjects.set(attempt.subjectId, entry)
    }
    return [...subjects.values()].map((entry) => ({
      title: entry.title,
      attempts: entry.attempts,
      rows: [...entry.groups.values()],
    }))
  }, [filtered])

  const handleClear = async () => {
    if (!window.confirm(`Удалить историю попыток игрока «${filter}»?`)) return
    await clearHistory(filter)
    setHistory((prev) => prev.filter((h) => h.playerName !== filter))
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Статистика
        </h1>
        {filtered.length > 0 && filter !== ALL && filter === playerName && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-all duration-150 hover:bg-slate-50 active:scale-[0.97] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Trash2 className="h-4 w-4" />
            Очистить мою историю
          </button>
        )}
      </div>

      {players.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter(ALL)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 active:scale-95 ${
              filter === ALL
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Все
          </button>
          {players.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFilter(name)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 active:scale-95 ${
                filter === name
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {name}
              {name === playerName ? ' (я)' : ''}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Загрузка...</p>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-rose-300 py-16 text-rose-500 dark:border-rose-500/40 dark:text-rose-400">
          <WifiOff className="h-8 w-8" />
          <p>Не удалось загрузить данные. Проверьте соединение и обновите страницу.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-16 text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <BarChart3 className="h-8 w-8" />
          <p>Пока нет пройденных тестов</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Игрок</th>
                <th className="px-4 py-2 font-medium">Раздел</th>
                <th className="px-4 py-2 font-medium">Дата</th>
                <th className="px-4 py-2 font-medium">Баллы</th>
                <th className="px-4 py-2 font-medium">Процент</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.map((attempt) => (
                <tr key={attempt.id} className="bg-white dark:bg-slate-900">
                  <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                    {attempt.playerName}
                  </td>
                  <td className="px-4 py-2 text-slate-900 dark:text-slate-100">
                    {attempt.subjectTitle}
                  </td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                    {new Date(attempt.date).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                    {attempt.pointsEarned} / {attempt.maxPoints}
                  </td>
                  <td className="px-4 py-2 font-medium text-violet-600 dark:text-violet-400">
                    {attempt.percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && breakdownBySubject.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-1 text-lg font-medium text-slate-900 dark:text-slate-100">Сильные и слабые темы</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Суммарно по всем попыткам, слабые темы сверху.
          </p>
          <div className="flex flex-col gap-4">
            {breakdownBySubject.map((subject) => (
              <div
                key={subject.title}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{subject.title}</h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    попыток: {subject.attempts}
                  </span>
                </div>
                <TopicBreakdown rows={subject.rows} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
