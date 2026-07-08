import { createClient } from '@libsql/client'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { subjects } from '../src/data/subjects.js'
import { questions } from '../src/data/questions.js'
import { materials } from '../src/data/materials.js'
import { blueprint } from '../src/data/blueprint.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Local dev: plain SQLite file via libSQL's local file mode (works with zero setup, no account needed).
// Production (Vercel): set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN to a real Turso database,
// since serverless functions have no persistent local disk.
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, 'local.db')}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Bump this whenever src/data/subjects.js, materials.js, questions.js or blueprint.js change,
// so deployed databases refresh their content without wiping the attempts (progress) table.
const CONTENT_VERSION = '2025-07-09-01'

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    color TEXT,
    selection TEXT NOT NULL DEFAULT 'single',
    scoring TEXT NOT NULL DEFAULT 'binary',
    options_count INTEGER NOT NULL DEFAULT 4,
    minutes_per_question REAL NOT NULL DEFAULT 2,
    total_minutes INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    summary TEXT,
    points TEXT,
    example TEXT,
    UNIQUE(subject_id, name)
  )`,
  `CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    title TEXT NOT NULL,
    position INTEGER NOT NULL,
    difficulty TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    group_id TEXT REFERENCES groups(id),
    difficulty TEXT,
    topic TEXT,
    text TEXT NOT NULL,
    options TEXT NOT NULL,
    correct TEXT NOT NULL,
    explanation TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL DEFAULT 'Аноним',
    subject_id TEXT NOT NULL,
    subject_title TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    points_earned REAL NOT NULL,
    max_points REAL NOT NULL,
    percent INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
]

function buildSeedStatements() {
  const statements = []

  for (const s of subjects) {
    const format = blueprint[s.id]
    statements.push({
      sql: `INSERT INTO subjects (id, title, description, color, selection, scoring, options_count, minutes_per_question, total_minutes, total_questions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        s.id,
        s.title,
        s.description,
        s.color,
        format?.selection ?? 'single',
        format?.scoring ?? 'binary',
        format?.optionsPerQuestion ?? 4,
        format?.minutesPerQuestion ?? 2,
        format?.totalMinutes ?? 0,
        format?.totalQuestions ?? 0,
      ],
    })

    s.topics.forEach((topic, index) => {
      const content = materials[s.id]?.[topic]
      statements.push({
        sql: `INSERT INTO topics (subject_id, name, position, summary, points, example) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          s.id,
          topic,
          index,
          content?.summary ?? null,
          content?.points ? JSON.stringify(content.points) : null,
          content?.example ?? null,
        ],
      })
    })

    format?.groups.forEach((g, index) => {
      statements.push({
        sql: `INSERT INTO groups (id, subject_id, title, position, difficulty) VALUES (?, ?, ?, ?, ?)`,
        args: [g.id, s.id, g.title, index, JSON.stringify(g.difficulty)],
      })
    })
  }

  for (const [subjectId, subjectQuestions] of Object.entries(questions)) {
    for (const q of subjectQuestions) {
      statements.push({
        sql: `INSERT INTO questions (id, subject_id, group_id, difficulty, topic, text, options, correct, explanation)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          q.id,
          subjectId,
          q.group ?? null,
          q.difficulty ?? null,
          q.topic ?? null,
          q.text,
          JSON.stringify(q.options),
          JSON.stringify(q.correct),
          q.explanation ?? null,
        ],
      })
    }
  }

  return statements
}

let readyPromise = null

export function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await client.batch(SCHEMA, 'write')
      const { rows } = await client.execute("SELECT value FROM meta WHERE key = 'content_version'")
      const currentVersion = rows[0]?.value

      if (currentVersion !== CONTENT_VERSION) {
        await client.batch(
          [
            'DELETE FROM questions',
            'DELETE FROM groups',
            'DELETE FROM topics',
            'DELETE FROM subjects',
            ...buildSeedStatements(),
            {
              sql: 'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
              args: ['content_version', CONTENT_VERSION],
            },
          ],
          'write',
        )
        console.log(`Database content refreshed to version ${CONTENT_VERSION}.`)
      }
    })()
  }
  return readyPromise
}

export default client
