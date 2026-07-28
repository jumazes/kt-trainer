import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Flag, BookOpenCheck, Clock } from 'lucide-react'
import { getSubject, getQuestions, postAttempt } from '../api/client'
import { getPlayerName } from '../hooks/usePlayerName'
import QuestionCard from '../components/QuestionCard'
import QuestionNavigator from '../components/QuestionNavigator'
import ProgressBar from '../components/ProgressBar'
import Timer from '../components/Timer'

function errorCount(selected, correct) {
  const selectedSet = new Set(selected)
  const correctSet = new Set(correct)
  let errors = 0
  for (const i of selectedSet) if (!correctSet.has(i)) errors++
  for (const i of correctSet) if (!selectedSet.has(i)) errors++
  return errors
}

export default function Quiz() {
  const { subjectId } = useParams()
  const navigate = useNavigate()

  const [subject, setSubject] = useState(null)
  const [subjectQuestions, setSubjectQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // null until the player picks a mode: 'training' (instant feedback) or 'exam'.
  const [mode, setMode] = useState(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [checkedIds, setCheckedIds] = useState(() => new Set())
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    Promise.all([getSubject(subjectId), getQuestions(subjectId)])
      .then(([subjectData, questionsData]) => {
        setSubject(subjectData)
        setSubjectQuestions(questionsData)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [subjectId])

  const answeredCount = useMemo(
    () => subjectQuestions.filter((q) => (answers[q.id] ?? []).length > 0).length,
    [subjectQuestions, answers],
  )

  const started = mode !== null

  useEffect(() => {
    if (!started || answeredCount === 0) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [started, answeredCount])

  if (loading) {
    return <p className="text-slate-500 dark:text-slate-400">Загрузка...</p>
  }

  if (notFound || !subject || subjectQuestions.length === 0) {
    return (
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-300">Раздел не найден или в нём нет вопросов.</p>
        <Link to="/" className="mt-4 inline-block text-violet-600 hover:underline dark:text-violet-400">
          Вернуться на главную
        </Link>
      </div>
    )
  }

  const isMultiple = subject.format.selection === 'multiple'
  const total = subjectQuestions.length

  if (!started) {
    return (
      <div className="mx-auto max-w-xl">
        <Link
          to={`/subject/${subject.id}`}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {subject.title}
        </Link>

        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{subject.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {total} вопросов · {subject.format.totalMinutes} минут ·{' '}
          {isMultiple ? 'один или несколько верных ответов' : `один верный из ${subject.format.optionsCount}`}
        </p>

        <p className="mt-6 mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          Выберите режим прохождения:
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setMode('training')}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-150 hover:border-violet-300 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/50"
          >
            <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
            <span>
              <span className="block font-medium text-slate-900 dark:text-slate-100">Тренировка</span>
              <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                Можно проверять ответ сразу и читать разбор. Пока открыт разбор, таймер стоит на паузе.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode('exam')}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-150 hover:border-violet-300 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/50"
          >
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
            <span>
              <span className="block font-medium text-slate-900 dark:text-slate-100">Экзамен</span>
              <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                Без подсказок по ходу, часы идут непрерывно. Полный разбор всех вопросов — после завершения.
              </span>
            </span>
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          В обоих режимах вопросы можно пропускать и возвращаться к ним, как на настоящем КТ.
        </p>
      </div>
    )
  }

  const currentQuestion = subjectQuestions[index]
  const selectedForCurrent = answers[currentQuestion.id] ?? []
  const isCurrentChecked = checkedIds.has(currentQuestion.id)

  const statuses = subjectQuestions.map((q) => {
    if (checkedIds.has(q.id)) {
      return errorCount(answers[q.id] ?? [], q.correct) === 0 ? 'correct' : 'wrong'
    }
    return (answers[q.id] ?? []).length > 0 ? 'answered' : 'empty'
  })

  const handleSelect = (optionIndex) => {
    if (isCurrentChecked) return
    setAnswers((prev) => {
      const current = prev[currentQuestion.id] ?? []
      if (!isMultiple) {
        return { ...prev, [currentQuestion.id]: [optionIndex] }
      }
      const next = current.includes(optionIndex)
        ? current.filter((i) => i !== optionIndex)
        : [...current, optionIndex]
      return { ...prev, [currentQuestion.id]: next }
    })
  }

  const handleCheck = () =>
    setCheckedIds((prev) => new Set(prev).add(currentQuestion.id))

  const finishQuiz = async ({ skipConfirm = false } = {}) => {
    if (finishing) return
    const unanswered = total - answeredCount
    if (!skipConfirm && unanswered > 0) {
      if (!window.confirm(`Не отвечено вопросов: ${unanswered}. Всё равно завершить тест?`)) return
    }
    setFinishing(true)

    let pointsEarned = 0
    let maxPoints = 0

    for (const q of subjectQuestions) {
      const selected = answers[q.id] ?? []
      const isPartial = subject.format.scoring === 'partial'
      maxPoints += isPartial ? 2 : 1
      // An unanswered question scores nothing. Without this, the partial-credit
      // formula would treat "selected nothing" as a single error and award half
      // credit — more than an actually wrong answer earns.
      if (selected.length === 0) continue
      const errors = errorCount(selected, q.correct)
      if (isPartial) {
        pointsEarned += errors === 0 ? 2 : errors === 1 ? 1 : 0
      } else {
        pointsEarned += errors === 0 ? 1 : 0
      }
    }

    const percent = Math.round((pointsEarned / maxPoints) * 100)
    const attempt = {
      playerName: getPlayerName() || 'Аноним',
      subjectId,
      subjectTitle: subject.title,
      totalQuestions: total,
      pointsEarned,
      maxPoints,
      percent,
    }

    try {
      await postAttempt(attempt)
    } catch (err) {
      console.error('Не удалось сохранить результат теста на сервере', err)
    }

    navigate('/results', {
      state: {
        ...attempt,
        date: new Date().toISOString(),
        multiple: isMultiple,
        review: subjectQuestions.map((q) => ({ question: q, selected: answers[q.id] ?? [] })),
      },
    })
  }

  const handleExit = () => {
    if (answeredCount === 0 || window.confirm('Прервать тест? Текущий прогресс не будет сохранён.')) {
      navigate('/')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Выйти
        </button>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {mode === 'exam' ? 'Экзамен' : 'Тренировка'}
          </span>
          <Timer
            running={!finishing && !(mode === 'training' && isCurrentChecked)}
            totalMinutes={subject.format.totalMinutes}
            onTimeUp={() => finishQuiz({ skipConfirm: true })}
          />
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar current={answeredCount} total={total} label={`Отвечено ${answeredCount} из ${total}`} />
      </div>

      <div className="mb-5">
        <QuestionNavigator statuses={statuses} currentIndex={index} onJump={setIndex} />
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        selected={selectedForCurrent}
        onSelect={handleSelect}
        showResult={isCurrentChecked}
        multiple={isMultiple}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>

        <div className="flex items-center gap-2">
          {mode === 'training' && !isCurrentChecked && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={selectedForCurrent.length === 0}
              className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-medium text-violet-700 transition-all duration-150 hover:bg-violet-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 dark:border-violet-500/40 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              Проверить
            </button>
          )}
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={index === total - 1}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-violet-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            Далее
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => finishQuiz()}
          disabled={finishing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Flag className="h-4 w-4" />
          Завершить тест
        </button>
      </div>
    </div>
  )
}
