import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, BarChart3 } from 'lucide-react'
import PlayerNameBadge from './PlayerNameBadge'

const navItems = [
  { to: '/', label: 'Главная', icon: LayoutDashboard, end: true },
  { to: '/stats', label: 'Статистика', icon: BarChart3, end: false },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex shrink-0 items-center gap-1.5 font-semibold sm:gap-2">
            <GraduationCap className="h-6 w-6 shrink-0 text-violet-600 dark:text-violet-400" />
            <span className="whitespace-nowrap text-sm sm:text-base">КТ Тренажёр</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <nav className="flex gap-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                      isActive
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="hidden h-5 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
            <PlayerNameBadge />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div key={location.pathname} className="animate-fade-slide-in">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
        Aslan Jumajan
      </footer>
    </div>
  )
}
