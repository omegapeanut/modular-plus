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
import { uploadImage } from '../lib/cloudinary'

interface Product {
  name: string
  sku: string
  quantity: number
  price: number
  imageUrl?: string
  createdAt: unknown
}

export default function Inventory() {
  const { data: products, loading } = useCollection<Product>('products')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setName('')
    setSku('')
    setQuantity('')
    setPrice('')
    setFile(null)
    setShowForm(false)
  }

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl: string | undefined
      if (file) {
        const result = await uploadImage(file, 'modular-plus/products')
        imageUrl = result.secure_url
      }
      await addDoc(collection(db, 'products'), {
        name,
        sku,
        quantity: Number(quantity) || 0,
        price: Number(price) || 0,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
      })
      resetForm()
    } catch (err) {
      console.error(err)
      alert('Could not save product. Check the console for details.')
    } finally {
      setSaving(false)
    }
  }

  const adjustQuantity = async (id: string, delta: number, current: number) => {
    await updateDoc(doc(db, 'products', id), {
      quantity: Math.max(0, current + delta),
    })
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await deleteDoc(doc(db, 'products', id))
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jp text-2xl text-ink">Inventory &amp; Products</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Stock levels update live for both of you.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-clay px-4 py-2 text-sm font-medium text-paper hover:bg-clay-hover sm:self-start"
        >
          {showForm ? 'Cancel' : '+ Add product'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-taupe bg-paper p-4 sm:grid-cols-2 sm:p-6"
        >
          <input
            required
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <input
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-md border border-taupe bg-linen px-3 py-2 text-sm text-ink"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="col-span-2 text-sm text-ink-muted"
          />
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 rounded-md bg-clay py-2 text-sm font-medium text-paper hover:bg-clay-hover disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-ink-muted">No products yet.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="min-w-0 rounded-2xl border border-taupe bg-paper p-4">
              <div className="flex min-w-0 items-center gap-3">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded bg-linen" />
                )}
                <span className="min-w-0 flex-1 truncate font-medium text-ink">{p.name}</span>
                <button
                  onClick={() => remove(p.id)}
                  className="shrink-0 text-xs text-ink-muted hover:text-rust"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-ink-muted">SKU</p>
                  <p className="truncate text-sm text-ink">{p.sku || '—'}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-ink-muted">Price</p>
                  <p className="text-sm text-ink">${Number(p.price).toFixed(2)}</p>
                </div>
                <div className="col-span-2 min-w-0 sm:col-span-1">
                  <p className="text-xs uppercase tracking-wide text-ink-muted">Quantity</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      onClick={() => adjustQuantity(p.id, -1, p.quantity)}
                      className="h-6 w-6 shrink-0 rounded border border-taupe text-ink-muted hover:bg-linen"
                    >
                      −
                    </button>
                    <span
                      className={p.quantity <= 3 ? 'font-medium text-rust' : 'text-ink'}
                    >
                      {p.quantity}
                    </span>
                    <button
                      onClick={() => adjustQuantity(p.id, 1, p.quantity)}
                      className="h-6 w-6 shrink-0 rounded border border-taupe text-ink-muted hover:bg-linen"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
