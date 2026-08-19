import { useState, type FormEvent } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useCollection } from '../lib/useCollection'
import { useAuth } from '../context/AuthContext'

const COLUMNS = ['To do', 'In progress', 'Done'] as const

interface Task {
  title: string
  status: (typeof COLUMNS)[number]
  assignee: string
  createdAt: unknown
}

export default function Tasks() {
  const { user } = useAuth()
  const { data: tasks, loading } = useCollection<Task>('tasks')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        status: 'To do',
        assignee: user?.email || '',
        createdAt: serverTimestamp(),
      })
      setTitle('')
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'tasks', id), { status })
  }

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-jp text-2xl text-ink">Team Tasks</h1>
        <p className="mt-1 text-sm text-ink-muted">
          A shared board — drag isn't wired up, just move cards with the buttons.
        </p>
      </div>

      <form onSubmit={handleAdd} className="mb-6 flex gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task…"
          className="flex-1 rounded-md border border-taupe bg-paper px-3 py-2 text-sm text-ink"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-clay px-4 py-2 text-sm font-medium text-paper hover:bg-clay-hover disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map((column) => (
            <div key={column} className="rounded-2xl border border-taupe bg-linen p-4">
              <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {column} ·{' '}
                {tasks.filter((t) => t.status === column).length}
              </h3>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === column)
                  .map((t) => {
                    const currentIndex = COLUMNS.indexOf(t.status)
                    return (
                      <div
                        key={t.id}
                        className="rounded-xl border border-taupe bg-paper p-3 text-sm"
                      >
                        <p className="mb-2 text-ink">{t.title}</p>
                        <p className="mb-2 truncate text-xs text-ink-muted">
                          {t.assignee}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {currentIndex > 0 && (
                              <button
                                onClick={() =>
                                  setStatus(t.id, COLUMNS[currentIndex - 1])
                                }
                                className="rounded border border-taupe px-2 py-0.5 text-xs text-ink-muted hover:bg-linen"
                              >
                                ←
                              </button>
                            )}
                            {currentIndex < COLUMNS.length - 1 && (
                              <button
                                onClick={() =>
                                  setStatus(t.id, COLUMNS[currentIndex + 1])
                                }
                                className="rounded border border-taupe px-2 py-0.5 text-xs text-ink-muted hover:bg-linen"
                              >
                                →
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => remove(t.id)}
                            className="text-xs text-ink-muted hover:text-rust"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
