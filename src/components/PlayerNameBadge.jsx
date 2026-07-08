import { useState } from 'react'
import { User, Pencil, Check } from 'lucide-react'
import { usePlayerName } from '../hooks/usePlayerName'

export default function PlayerNameBadge() {
  const [name, setName] = usePlayerName()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  const save = () => {
    const trimmed = draft.trim()
    setName(trimmed)
    setEditing(false)
  }

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="flex items-center gap-1"
      >
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ваше имя"
          maxLength={30}
          className="w-32 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          className="rounded-md p-1.5 text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
        >
          <Check className="h-4 w-4" />
        </button>
      </form>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(name)
        setEditing(true)
      }}
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <User className="h-4 w-4" />
      {name || 'Указать имя'}
      <Pencil className="h-3 w-3 text-slate-400" />
    </button>
  )
}
