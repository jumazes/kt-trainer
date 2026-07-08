import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react'
import { getSubject, getQuestions, postAttempt } from '../api/client'
import { getPlayerName } from '../hooks/usePlayerName'
import QuestionCard from '../components/QuestionCard'
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

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)

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
  const currentQuestion = subjectQuestions[index]
  const isLast = index === subjectQuestions.length - 1
  const selectedForCurrent = answers[currentQuestion.id] ?? []

  const handleSelect = (optionIndex) => {
    if (showResult) return
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

  const handleCheck = () => setShowResult(true)

  const finishQuiz = async (finalAnswers) => {
    let pointsEarned = 0
    let maxPoints = 0

    for (const q of subjectQuestions) {
      const selected = finalAnswers[q.id] ?? []
      if (subject.format.scoring === 'partial') {
        maxPoints += 2
        const errors = errorCount(selected, q.correct)
        pointsEarned += errors === 0 ? 2 : errors === 1 ? 1 : 0
      } else {
        maxPoints += 1
        const errors = errorCount(selected, q.correct)
        pointsEarned += errors === 0 ? 1 : 0
      }
    }

    const percent = Math.round((pointsEarned / maxPoints) * 100)
    const attempt = {
      playerName: getPlayerName() || 'Аноним',
      subjectId,
      subjectTitle: subject.title,
      totalQuestions: subjectQuestions.length,
      pointsEarned,
      maxPoints,
      percent,
    }
    await postAttempt(attempt)
    navigate('/results', { state: { ...attempt, date: new Date().toISOString() } })
  }

  const handleNext = () => {
    if (isLast) {
      finishQuiz(answers)
      return
    }
    setIndex((i) => i + 1)
    setShowResult(false)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Выйти
        </Link>
        <Timer running={!showResult} totalMinutes={subject.format.totalMinutes} />
      </div>

      <div className="mb-6">
        <ProgressBar current={index + 1} total={subjectQuestions.length} />
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        selected={selectedForCurrent}
        onSelect={handleSelect}
        showResult={showResult}
        multiple={isMultiple}
      />

      <div className="mt-5 flex justify-end gap-2">
        {!showResult ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={selectedForCurrent.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-violet-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            Проверить
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-violet-700 active:scale-[0.97]"
          >
            {isLast ? (
              <>
                Завершить <Flag className="h-4 w-4" />
              </>
            ) : (
              <>
                Следующий <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
