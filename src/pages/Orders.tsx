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

const STATUSES = ['New', 'Processing', 'Shipped', 'Completed', 'Cancelled']

interface Order {
  customerName: string
  total: number
  status: string
  createdAt: unknown
}

const statusColor: Record<string, string> = {
  New: 'bg-mist-bg text-mist',
  Processing: 'bg-ochre-bg text-ochre',
  Shipped: 'bg-sage-bg text-sage',
  Completed: 'bg-clay/10 text-clay',
  Cancelled: 'bg-rust-bg text-rust',
}

export default function Orders() {
  const { data: orders, loading } = useCollection<Order>('orders')
  const [showForm, setShowForm] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [total, setTotal] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addDoc(collection(db, 'orders'), {
        customerName,
        total: Number(total) || 0,
        status: 'New',
        createdAt: serverTimestamp(),
      })
      setCustomerName('')
      setTotal('')
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'orders', id), { status })
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this order?')) return
    await deleteDoc(doc(db, 'orders', id))
  }

  const revenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0)

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jp text-2xl text-ink">Orders &amp; Sales</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {orders.length} orders · ${revenue.toFixed(2)} total revenue
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-clay px-4 py-2 text-sm font-medium text-paper hover:bg-clay-hover sm:self-start"
        >
          {showForm ? 'Cancel' : '+ New order'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-taupe bg-paper p-4 sm:grid-cols-3 sm:p-6"
        >
          <input
            required
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink sm:col-span-2"
          />
          <input
            type="number"
            step="0.01"
            required
            placeholder="Total ($)"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-clay py-2 text-sm font-medium text-paper hover:bg-clay-hover disabled:opacity-60 sm:col-span-3"
          >
            {saving ? 'Saving…' : 'Create order'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-ink-muted">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="min-w-0 rounded-2xl border border-taupe bg-paper p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0 truncate font-medium text-ink">{o.customerName}</span>
                <button
                  onClick={() => remove(o.id)}
                  className="shrink-0 text-xs text-ink-muted hover:text-rust"
                >
                  Delete
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-sm text-ink">${Number(o.total).toFixed(2)}</span>
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  className={`rounded-full border-0 px-2 py-1 text-xs font-medium ${statusColor[o.status] || 'bg-linen text-ink-muted'}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
