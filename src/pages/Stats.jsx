import { useEffect, useMemo, useState } from 'react'
import { Trash2, BarChart3 } from 'lucide-react'
import { getHistory, clearHistory } from '../api/client'
import { getPlayerName } from '../hooks/usePlayerName'

const ALL = '__all__'

export default function Stats() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const playerName = getPlayerName()
  const [filter, setFilter] = useState(playerName || ALL)

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .finally(() => setLoading(false))
  }, [])

  const players = useMemo(() => {
    const names = new Set(history.map((h) => h.playerName))
    return [...names].sort()
  }, [history])

  const filtered = filter === ALL ? history : history.filter((h) => h.playerName === filter)

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
    </div>
  )
}
