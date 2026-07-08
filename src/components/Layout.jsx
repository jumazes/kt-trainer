import { NavLink, Outlet } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, BarChart3 } from 'lucide-react'
import PlayerNameBadge from './PlayerNameBadge'

const navItems = [
  { to: '/', label: 'Главная', icon: LayoutDashboard, end: true },
  { to: '/stats', label: 'Статистика', icon: BarChart3, end: false },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            <span>КТ Тренажёр</span>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex gap-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <PlayerNameBadge />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
