import express from 'express'
import client, { ensureReady } from './db.js'

const app = express()
app.use(express.json())

app.use(async (req, res, next) => {
  try {
    await ensureReady()
    next()
  } catch (err) {
    next(err)
  }
})

function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

async function getSubjectRow(id) {
  const { rows } = await client.execute({ sql: 'SELECT * FROM subjects WHERE id = ?', args: [id] })
  return rows[0]
}

async function attachSubjectDetails(subject) {
  const [{ rows: topicRows }, { rows: groupRows }, { rows: countRows }] = await Promise.all([
    client.execute({
      sql: 'SELECT name FROM topics WHERE subject_id = ? ORDER BY position',
      args: [subject.id],
    }),
    client.execute({
      sql: 'SELECT id, title, difficulty FROM groups WHERE subject_id = ? ORDER BY position',
      args: [subject.id],
    }),
    client.execute({ sql: 'SELECT COUNT(*) AS c FROM questions WHERE subject_id = ?', args: [subject.id] }),
  ])

  return {
    id: subject.id,
    title: subject.title,
    description: subject.description,
    color: subject.color,
    topics: topicRows.map((t) => t.name),
    questionCount: Number(countRows[0].c),
    format: {
      selection: subject.selection,
      scoring: subject.scoring,
      optionsCount: subject.options_count,
      minutesPerQuestion: subject.minutes_per_question,
      totalMinutes: subject.total_minutes,
      totalQuestions: subject.total_questions,
    },
    groups: groupRows.map((g) => ({
      id: g.id,
      title: g.title,
      difficulty: JSON.parse(g.difficulty),
    })),
  }
}

app.get('/api/subjects', async (req, res) => {
  const { rows } = await client.execute('SELECT * FROM subjects')
  res.json(await Promise.all(rows.map(attachSubjectDetails)))
})

app.get('/api/subjects/:id', async (req, res) => {
  const subject = await getSubjectRow(req.params.id)
  if (!subject) return res.status(404).json({ error: 'Subject not found' })
  res.json(await attachSubjectDetails(subject))
})

app.get('/api/subjects/:id/materials', async (req, res) => {
  const { rows } = await client.execute({
    sql: 'SELECT name, summary, points, example FROM topics WHERE subject_id = ? ORDER BY position',
    args: [req.params.id],
  })
  const result = {}
  for (const row of rows) {
    result[row.name] = {
      summary: row.summary ?? undefined,
      points: row.points ? JSON.parse(row.points) : undefined,
      example: row.example ?? undefined,
    }
  }
  res.json(result)
})

app.get('/api/subjects/:id/questions', async (req, res) => {
  const { rows } = await client.execute({
    sql: 'SELECT * FROM questions WHERE subject_id = ?',
    args: [req.params.id],
  })
  const questionsList = rows.map((r) => ({
    id: r.id,
    group: r.group_id ?? undefined,
    difficulty: r.difficulty ?? undefined,
    topic: r.topic ?? undefined,
    text: r.text,
    options: JSON.parse(r.options),
    correct: JSON.parse(r.correct),
    explanation: r.explanation ?? undefined,
  }))
  res.json(shuffle(questionsList))
})

app.get('/api/attempts', async (req, res) => {
  const { playerName } = req.query
  const { rows } = playerName
    ? await client.execute({
        sql: 'SELECT * FROM attempts WHERE player_name = ? ORDER BY created_at DESC',
        args: [playerName],
      })
    : await client.execute('SELECT * FROM attempts ORDER BY created_at DESC')
  res.json(
    rows.map((r) => ({
      id: r.id,
      playerName: r.player_name,
      subjectId: r.subject_id,
      subjectTitle: r.subject_title,
      totalQuestions: r.total_questions,
      pointsEarned: r.points_earned,
      maxPoints: r.max_points,
      percent: r.percent,
      date: r.created_at,
    })),
  )
})

app.post('/api/attempts', async (req, res) => {
  const { playerName, subjectId, subjectTitle, totalQuestions, pointsEarned, maxPoints, percent } = req.body
  if (
    !subjectId ||
    !subjectTitle ||
    totalQuestions == null ||
    pointsEarned == null ||
    maxPoints == null ||
    percent == null
  ) {
    return res.status(400).json({ error: 'Missing required attempt fields' })
  }
  const result = await client.execute({
    sql: 'INSERT INTO attempts (player_name, subject_id, subject_title, total_questions, points_earned, max_points, percent) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [playerName || 'Аноним', subjectId, subjectTitle, totalQuestions, pointsEarned, maxPoints, percent],
  })
  res.status(201).json({ id: Number(result.lastInsertRowid) })
})

app.delete('/api/attempts', async (req, res) => {
  const { playerName } = req.query
  if (!playerName) {
    return res.status(400).json({ error: 'playerName query param is required to clear history' })
  }
  await client.execute({ sql: 'DELETE FROM attempts WHERE player_name = ?', args: [playerName] })
  res.json({ ok: true })
})

export default app
