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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Project Schedule</h1>
        <p className="text-sm text-slate-500">Milestones and deadlines, soonest first.</p>
      </div>

      <form
        onSubmit={handleAdd}
        className="mb-6 flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <input
          required
          placeholder="Milestone"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          required
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing scheduled yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((m) => {
            const overdue = m.dueDate < today
            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{m.title}</p>
                  <p
                    className={`text-xs ${overdue ? 'font-medium text-red-600' : 'text-slate-400'}`}
                  >
                    {m.dueDate} {overdue && '· overdue'}
                  </p>
                </div>
                <button
                  onClick={() => remove(m.id)}
                  className="text-xs text-slate-400 hover:text-red-600"
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
