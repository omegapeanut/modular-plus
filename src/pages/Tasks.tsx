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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Team Tasks</h1>
        <p className="text-sm text-slate-500">
          A shared board — drag isn't wired up, just move cards with the buttons.
        </p>
      </div>

      <form onSubmit={handleAdd} className="mb-6 flex gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map((column) => (
            <div key={column} className="rounded-xl bg-slate-100 p-3">
              <h3 className="mb-3 px-1 text-xs font-semibold uppercase text-slate-500">
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
                        className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm"
                      >
                        <p className="mb-2 text-slate-800">{t.title}</p>
                        <p className="mb-2 truncate text-xs text-slate-400">
                          {t.assignee}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {currentIndex > 0 && (
                              <button
                                onClick={() =>
                                  setStatus(t.id, COLUMNS[currentIndex - 1])
                                }
                                className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
                              >
                                ←
                              </button>
                            )}
                            {currentIndex < COLUMNS.length - 1 && (
                              <button
                                onClick={() =>
                                  setStatus(t.id, COLUMNS[currentIndex + 1])
                                }
                                className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
                              >
                                →
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => remove(t.id)}
                            className="text-xs text-slate-400 hover:text-red-600"
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
