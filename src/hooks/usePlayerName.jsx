import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'kt-player-name'
const PlayerNameContext = createContext(null)

export function getPlayerName() {
  return window.localStorage.getItem(KEY) || ''
}

export function PlayerNameProvider({ children }) {
  const [name, setName] = useState(getPlayerName)

  useEffect(() => {
    window.localStorage.setItem(KEY, name)
  }, [name])

  return (
    <PlayerNameContext.Provider value={[name, setName]}>{children}</PlayerNameContext.Provider>
  )
}

export function usePlayerName() {
  const ctx = useContext(PlayerNameContext)
  if (!ctx) {
    throw new Error('usePlayerName must be used within a PlayerNameProvider')
  }
  return ctx
}
