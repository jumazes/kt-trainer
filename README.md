# KT Trainer

A web app for practicing the Comprehensive Testing (KT) exam required for graduate school admission. The exam format, topic breakdown, and difficulty distribution match the official specification exactly.

🔗 **[kt-trainer.vercel.app](https://kt-trainer.vercel.app)**

## Subjects

- **Algorithms & Data Structures** — 30 questions, single correct answer out of 5, 60 minutes
- **Databases** — 20 questions, single or multiple correct answers (partial credit scoring), 50 minutes

## Features

- Take a timed practice exam that matches the real KT format exactly
- Study theory for every topic, with code examples and interactive diagrams
- Track your results over time

## Stack

React 19 + Vite + Tailwind CSS v4 (frontend), Express 5 + Turso/libSQL (backend), deployed on Vercel.

## Running locally

```bash
npm install
npm run dev
```

The client runs at `http://localhost:5173`, the API server at `http://localhost:3001`. Without environment variables the server falls back to a local SQLite file; to connect to Turso, copy `.env.example` to `.env` and fill in your `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

Other commands:

```bash
npm run lint     # lint the code
npm run build    # production build
npm start        # build + run via Express (self-hosted mode)
```
