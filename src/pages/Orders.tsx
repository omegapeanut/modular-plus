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
  New: 'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders &amp; Sales</h1>
          <p className="text-sm text-slate-500">
            {orders.length} orders · ${revenue.toFixed(2)} total revenue
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {showForm ? 'Cancel' : '+ New order'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-5"
        >
          <input
            required
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="0.01"
            required
            placeholder="Total ($)"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="col-span-3 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Create order'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-500">No orders yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">${Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                      className={`rounded-full border-0 px-2 py-1 text-xs font-medium ${statusColor[o.status] || 'bg-slate-100 text-slate-700'}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(o.id)}
                      className="text-xs text-slate-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
