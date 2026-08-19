import { useState, type FormEvent } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useCollection } from '../lib/useCollection'

interface Customer {
  name: string
  email: string
  phone: string
  notes: string
  createdAt: unknown
}

export default function Customers() {
  const { data: customers, loading } = useCollection<Customer>('customers')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addDoc(collection(db, 'customers'), {
        name,
        email,
        phone,
        notes,
        createdAt: serverTimestamp(),
      })
      setName('')
      setEmail('')
      setPhone('')
      setNotes('')
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this customer?')) return
    await deleteDoc(doc(db, 'customers', id))
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jp text-2xl text-ink">Customers</h1>
          <p className="mt-1 text-sm text-ink-muted">Shared contact list and notes.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-clay px-4 py-2 text-sm font-medium text-paper hover:bg-clay-hover sm:self-start"
        >
          {showForm ? 'Cancel' : '+ Add customer'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-taupe bg-paper p-4 sm:grid-cols-2 sm:p-6"
        >
          <input
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <input
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 rounded-md bg-clay py-2 text-sm font-medium text-paper hover:bg-clay-hover disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save customer'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-ink-muted">No customers yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {customers.map((c) => (
            <div
              key={c.id}
              className="min-w-0 rounded-2xl border border-taupe bg-paper p-5"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="min-w-0 truncate font-medium text-ink">{c.name}</h3>
                <button
                  onClick={() => remove(c.id)}
                  className="shrink-0 text-xs text-ink-muted hover:text-rust"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-ink-muted">{c.email || '—'}</p>
              <p className="text-sm text-ink-muted">{c.phone || '—'}</p>
              {c.notes && (
                <p className="mt-2 rounded bg-linen p-2 text-xs text-ink-muted">
                  {c.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
