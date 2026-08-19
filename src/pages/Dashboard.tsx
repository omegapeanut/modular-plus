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
      <div className="mb-8">
        <h1 className="font-jp text-2xl text-ink">Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Live snapshot of the business — updates instantly for both of you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="min-w-0 rounded-2xl border border-taupe bg-paper p-4 sm:p-6"
          >
            <p className="text-xs font-medium uppercase leading-snug tracking-wide text-ink-muted">
              {c.label}
            </p>
            <p className="font-jp mt-3 text-2xl text-ink sm:text-3xl">{c.value}</p>
            <p className="mt-1 text-xs leading-snug text-ink-muted">{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
