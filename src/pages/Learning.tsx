import { useState, type FormEvent } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useCollection } from '../lib/useCollection'

interface Resource {
  title: string
  url: string
  category: string
  createdAt: unknown
}

export default function Learning() {
  const { data: resources, loading } = useCollection<Resource>('learning')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addDoc(collection(db, 'learning'), {
        title,
        url,
        category: category || 'General',
        createdAt: serverTimestamp(),
      })
      setTitle('')
      setUrl('')
      setCategory('')
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'learning', id))
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Learning Material</h1>
          <p className="text-sm text-slate-500">
            Docs, guides and links the team should know about.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {showForm ? 'Cancel' : '+ Add resource'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-5"
        >
          <input
            required
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="url"
            placeholder="Link (https://…)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Category (e.g. Onboarding)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="col-span-3 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Add resource'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : resources.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing added yet.</p>
      ) : (
        <div className="space-y-2">
          {resources.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-slate-900 hover:underline"
                >
                  {r.title}
                </a>
                <p className="text-xs text-slate-400">{r.category}</p>
              </div>
              <button
                onClick={() => remove(r.id)}
                className="text-xs text-slate-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
