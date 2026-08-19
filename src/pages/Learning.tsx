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
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jp text-2xl text-ink">Learning Material</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Docs, guides and links the team should know about.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-clay px-4 py-2 text-sm font-medium text-paper hover:bg-clay-hover sm:self-start"
        >
          {showForm ? 'Cancel' : '+ Add resource'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-taupe bg-paper p-4 sm:grid-cols-3 sm:p-6"
        >
          <input
            required
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <input
            required
            type="url"
            placeholder="Link (https://…)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <input
            placeholder="Category (e.g. Onboarding)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-clay py-2 text-sm font-medium text-paper hover:bg-clay-hover disabled:opacity-60 sm:col-span-3"
          >
            {saving ? 'Saving…' : 'Add resource'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : resources.length === 0 ? (
        <p className="text-sm text-ink-muted">Nothing added yet.</p>
      ) : (
        <div className="space-y-2">
          {resources.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-taupe bg-paper px-4 py-3"
            >
              <div className="min-w-0">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-medium text-ink hover:text-clay"
                >
                  {r.title}
                </a>
                <p className="text-xs text-ink-muted">{r.category}</p>
              </div>
              <button
                onClick={() => remove(r.id)}
                className="shrink-0 text-xs text-ink-muted hover:text-rust"
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
