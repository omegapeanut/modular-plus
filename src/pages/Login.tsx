import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    const redirectTo = (location.state as { from?: string })?.from || '/'
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError('Could not sign in. Check your email and password.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linen px-4">
      <div className="w-full max-w-sm rounded-2xl border border-taupe bg-paper p-10 shadow-[0_1px_2px_rgba(43,38,33,0.04)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-clay text-lg font-medium text-paper">
            +
          </div>
          <h1 className="font-jp text-2xl text-ink">Modular Plus</h1>
          <div className="mx-auto mt-3 h-px w-10 bg-taupe" />
          <p className="mt-3 text-sm text-ink-muted">
            Sign in to the business dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink outline-none focus:border-clay focus:ring-1 focus:ring-clay"
              placeholder="you@modularplus.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink outline-none focus:border-clay focus:ring-1 focus:ring-clay"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-clay py-2 text-sm font-medium text-paper transition hover:bg-clay-hover disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-ink-muted">
          Accounts are created in the Firebase console — ask your partner if
          you don't have one yet.
        </p>
      </div>
    </div>
  )
}
