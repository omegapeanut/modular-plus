import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-linen lg:flex">
      {/* Mobile / tablet top bar */}
      <div className="flex items-center justify-between border-b border-taupe bg-paper px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-clay text-sm font-medium text-paper">
            +
          </div>
          <span className="font-jp text-base text-ink">Modular Plus</span>
        </div>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-taupe text-ink"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-20 bg-ink/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 max-w-[80vw] transform flex-col border-r border-taupe bg-paper transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="hidden items-center gap-3 border-b border-taupe px-6 py-6 lg:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-clay text-sm font-medium text-paper">
            +
          </div>
          <span className="font-jp text-lg text-ink">Modular Plus</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
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

      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
