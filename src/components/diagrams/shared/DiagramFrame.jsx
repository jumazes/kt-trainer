import StepControls from './StepControls'

export default function DiagramFrame({ player, note, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      {children}
      <p className="mt-4 min-h-[1.5rem] text-center text-sm font-medium text-slate-700 dark:text-slate-300">
        {note}
      </p>
      <StepControls player={player} />
    </div>
  )
}
