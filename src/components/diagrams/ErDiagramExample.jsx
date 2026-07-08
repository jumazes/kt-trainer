function EntityBox({ title, attrs, highlight }) {
  return (
    <div
      className={`w-full shrink-0 overflow-hidden rounded-lg border-2 sm:w-40 ${
        highlight
          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
          : 'border-violet-400 bg-white dark:bg-slate-900'
      }`}
    >
      <div
        className={`px-3 py-1.5 text-center text-sm font-semibold text-white ${
          highlight ? 'bg-amber-500' : 'bg-violet-600'
        }`}
      >
        {title}
      </div>
      <ul className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
        {attrs.map((a) => (
          <li key={a} className="py-0.5">
            {a}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Relation({ label }) {
  return (
    <div className="flex items-center justify-center gap-2 px-1 py-2 text-xs font-medium text-slate-400 sm:flex-col dark:text-slate-500">
      <div className="h-px w-6 bg-slate-300 sm:h-6 sm:w-px dark:bg-slate-700" />
      <span className="px-2">{label}</span>
      <div className="h-px w-6 bg-slate-300 sm:h-6 sm:w-px dark:bg-slate-700" />
    </div>
  )
}

export default function ErDiagramExample() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-stretch sm:justify-center">
        <EntityBox title="Студент" attrs={['id (PK)', 'ФИО', 'группа']} />
        <Relation label="1 : N" />
        <EntityBox title="Оценка" attrs={['id (PK)', 'студент_id (FK)', 'курс_id (FK)', 'балл']} highlight />
        <Relation label="N : 1" />
        <EntityBox title="Курс" attrs={['id (PK)', 'название', 'кредиты']} />
      </div>
      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        «Оценка» — связующая (ассоциативная) сущность: реализует связь «многие-ко-многим» между «Студент» и
        «Курс» через два внешних ключа
      </p>
    </div>
  )
}
