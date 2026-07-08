import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, PlayCircle, Search, BookOpen } from 'lucide-react'
import { getSubject, getMaterials } from '../api/client'

export default function Learn() {
  const { subjectId } = useParams()
  const [searchParams] = useSearchParams()
  const [subject, setSubject] = useState(null)
  const [subjectMaterials, setSubjectMaterials] = useState({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [query, setQuery] = useState('')
  const [openTopics, setOpenTopics] = useState(() => new Set())
  const topicRefs = useRef({})

  const initialTopic = searchParams.get('topic')

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    Promise.all([getSubject(subjectId), getMaterials(subjectId)])
      .then(([subjectData, materialsData]) => {
        setSubject(subjectData)
        setSubjectMaterials(materialsData)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [subjectId])

  useEffect(() => {
    if (!initialTopic || !subject) return
    setOpenTopics((prev) => new Set(prev).add(initialTopic))
    const el = topicRefs.current[initialTopic]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic, subject])

  const filteredTopics = useMemo(() => {
    if (!subject) return []
    const q = query.trim().toLowerCase()
    if (!q) return subject.topics
    return subject.topics.filter((topic) => topic.toLowerCase().includes(q))
  }, [subject, query])

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

  const toggleTopic = (topic) => {
    setOpenTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topic)) {
        next.delete(topic)
      } else {
        next.add(topic)
      }
      return next
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to={`/subject/${subject.id}`}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {subject.title}
        </Link>
        <Link
          to={`/quiz/${subject.id}`}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700"
        >
          <PlayCircle className="h-4 w-4" />
          Начать тест
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Изучение: {subject.title}
        </h1>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск темы..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Показано {filteredTopics.length} из {subject.topics.length} тем
      </p>

      <div className="flex flex-col gap-2">
        {filteredTopics.map((topic) => {
          const content = subjectMaterials[topic]
          const isOpen = openTopics.has(topic)
          return (
            <div
              key={topic}
              ref={(el) => {
                topicRefs.current[topic] = el
              }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => toggleTopic(topic)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {topic}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-800">
                  {content ? (
                    <>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {content.summary}
                      </p>
                      {content.points && (
                        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
                          {content.points.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      )}
                      {content.example && (
                        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 dark:bg-slate-950">
                          <code>{content.example}</code>
                        </pre>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Материал по этой теме пока не добавлен.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
