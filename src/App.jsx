import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SubjectDetail from './pages/SubjectDetail'
import Learn from './pages/Learn'
import Quiz from './pages/Quiz'
import Results from './pages/Results'
import Stats from './pages/Stats'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="subject/:subjectId" element={<SubjectDetail />} />
        <Route path="learn/:subjectId" element={<Learn />} />
        <Route path="quiz/:subjectId" element={<Quiz />} />
        <Route path="results" element={<Results />} />
        <Route path="stats" element={<Stats />} />
      </Route>
    </Routes>
  )
}

export default App
