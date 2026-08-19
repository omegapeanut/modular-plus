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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-jp text-2xl text-ink">Inventory &amp; Products</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Stock levels update live for both of you.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-clay px-4 py-2 text-sm font-medium text-paper hover:bg-clay-hover"
        >
          {showForm ? 'Cancel' : '+ Add product'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid grid-cols-2 gap-4 rounded-2xl border border-taupe bg-paper p-6"
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
        <div className="overflow-hidden rounded-2xl border border-taupe bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-linen text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-taupe">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="flex items-center gap-3 px-4 py-3 text-ink">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-linen" />
                    )}
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{p.sku || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustQuantity(p.id, -1, p.quantity)}
                        className="h-6 w-6 rounded border border-taupe text-ink-muted hover:bg-linen"
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
                        className="h-6 w-6 rounded border border-taupe text-ink-muted hover:bg-linen"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(p.id)}
                      className="text-xs text-ink-muted hover:text-rust"
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
