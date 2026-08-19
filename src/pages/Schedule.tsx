import { useState, type FormEvent } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useCollection } from '../lib/useCollection'

interface Milestone {
  title: string
  dueDate: string
  createdAt: unknown
}

export default function Schedule() {
  const { data: milestones, loading } = useCollection<Milestone>('schedule')
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'schedule'), {
        title,
        dueDate,
        createdAt: serverTimestamp(),
      })
      setTitle('')
      setDueDate('')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'schedule', id))
  }

  const sorted = [...milestones].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-jp text-2xl text-ink">Project Schedule</h1>
        <p className="mt-1 text-sm text-ink-muted">Milestones and deadlines, soonest first.</p>
      </div>

      <form
        onSubmit={handleAdd}
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-taupe bg-paper p-4 sm:flex-row"
      >
        <input
          required
          placeholder="Milestone"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
        />
        <input
          required
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink sm:w-auto"
        />
        <button
          type="submit"
          disabled={saving}
          className="shrink-0 rounded-md bg-clay px-4 py-2 text-sm font-medium text-paper hover:bg-clay-hover disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-ink-muted">Nothing scheduled yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((m) => {
            const overdue = m.dueDate < today
            return (
              <div
                key={m.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-taupe bg-paper px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{m.title}</p>
                  <p
                    className={`text-xs ${overdue ? 'font-medium text-rust' : 'text-ink-muted'}`}
                  >
                    {m.dueDate} {overdue && '· overdue'}
                  </p>
                </div>
                <button
                  onClick={() => remove(m.id)}
                  className="shrink-0 text-xs text-ink-muted hover:text-rust"
                >
                  Delete
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
