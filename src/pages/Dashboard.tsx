import { useCollection } from '../lib/useCollection'

export default function Dashboard() {
  const { data: products } = useCollection('products')
  const { data: orders } = useCollection('orders')
  const { data: customers } = useCollection('customers')
  const { data: tasks } = useCollection('tasks')

  const revenue = orders
    .filter((o: any) => o.status !== 'Cancelled')
    .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0)

  const lowStock = products.filter((p: any) => Number(p.quantity) <= 3).length
  const openTasks = tasks.filter((t: any) => t.status !== 'Done').length

  const cards = [
    { label: 'Products in stock', value: products.length, sub: `${lowStock} low stock` },
    { label: 'Orders', value: orders.length, sub: `$${revenue.toFixed(2)} revenue` },
    { label: 'Customers', value: customers.length, sub: 'total contacts' },
    { label: 'Open tasks', value: openTasks, sub: `${tasks.length} total` },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500">
          Live snapshot of the business — updates instantly for both of you.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-400">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
