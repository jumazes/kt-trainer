import { useEffect, useState } from 'react'

const KEY = 'kt-player-name'

export function getPlayerName() {
  return window.localStorage.getItem(KEY) || ''
}

export function usePlayerName() {
  const [name, setName] = useState(() => getPlayerName())

  useEffect(() => {
    window.localStorage.setItem(KEY, name)
  }, [name])

  return [name, setName]
}
