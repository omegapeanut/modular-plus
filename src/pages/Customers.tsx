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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Shared contact list and notes.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {showForm ? 'Cancel' : '+ Add customer'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5"
        >
          <input
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save customer'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-slate-500">No customers yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {customers.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-1 flex items-start justify-between">
                <h3 className="font-medium text-slate-900">{c.name}</h3>
                <button
                  onClick={() => remove(c.id)}
                  className="text-xs text-slate-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-slate-500">{c.email || '—'}</p>
              <p className="text-sm text-slate-500">{c.phone || '—'}</p>
              {c.notes && (
                <p className="mt-2 rounded bg-slate-50 p-2 text-xs text-slate-600">
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
