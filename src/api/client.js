async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API ${path} failed with status ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const getSubjects = () => request('/subjects')
export const getSubject = (subjectId) => request(`/subjects/${subjectId}`)
export const getMaterials = (subjectId) => request(`/subjects/${subjectId}/materials`)
export const getQuestions = (subjectId) => request(`/subjects/${subjectId}/questions`)
export const getHistory = (playerName) =>
  request(`/attempts${playerName ? `?playerName=${encodeURIComponent(playerName)}` : ''}`)
export const postAttempt = (attempt) =>
  request('/attempts', { method: 'POST', body: JSON.stringify(attempt) })
export const clearHistory = (playerName) =>
  request(`/attempts?playerName=${encodeURIComponent(playerName)}`, { method: 'DELETE' })
