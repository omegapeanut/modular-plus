import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/inventory', label: 'Inventory' },
  { to: '/orders', label: 'Orders' },
  { to: '/customers', label: 'Customers' },
  { to: '/tasks', label: 'Team Tasks' },
  { to: '/learning', label: 'Learning' },
  { to: '/schedule', label: 'Schedule' },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-linen">
      <aside className="flex w-64 flex-col border-r border-taupe bg-paper">
        <div className="flex items-center gap-3 border-b border-taupe px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-clay text-sm font-medium text-paper">
            +
          </div>
          <span className="font-jp text-lg text-ink">Modular Plus</span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-clay font-medium text-paper'
                    : 'text-ink-muted hover:bg-linen hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-taupe px-5 py-5">
          <p className="mb-2 truncate text-xs text-ink-muted">{user?.email}</p>
          <button
            onClick={() => logout()}
            className="w-full rounded-md border border-taupe py-2 text-xs font-medium text-ink-muted transition hover:bg-linen hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-10 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
