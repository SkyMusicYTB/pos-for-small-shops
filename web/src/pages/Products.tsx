import React, { useEffect, useState } from 'react'
import { api } from '../store/auth'

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [form, setForm] = useState({ sku: '', name: '', category: '', cost_price: 0, sell_price: 0, tax_rate: undefined as any, stock_qty: 0, low_stock_threshold: 0, active: true })
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    const { data } = await api.get('/products')
    setProducts(data)
  }
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try { await api.post('/products', form); setForm({ ...form, sku:'', name:'', category:'', cost_price:0, sell_price:0, stock_qty:0, low_stock_threshold:0 }); await load() } catch (e:any) { setError(e?.response?.data?.detail || 'Error') }
  }

  return (
    <div className="container">
      <h2>Products</h2>
      <form onSubmit={submit} className="grid">
        <input placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} />
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
        <input placeholder="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
        <input placeholder="Cost" type="number" value={form.cost_price} onChange={e=>setForm({...form, cost_price: parseFloat(e.target.value)})} />
        <input placeholder="Price" type="number" value={form.sell_price} onChange={e=>setForm({...form, sell_price: parseFloat(e.target.value)})} />
        <input placeholder="Tax % (opt)" type="number" value={form.tax_rate ?? ''} onChange={e=>setForm({...form, tax_rate: e.target.value ? parseFloat(e.target.value) : undefined})} />
        <input placeholder="Stock" type="number" value={form.stock_qty} onChange={e=>setForm({...form, stock_qty: parseFloat(e.target.value)})} />
        <input placeholder="Low-stock" type="number" value={form.low_stock_threshold} onChange={e=>setForm({...form, low_stock_threshold: parseFloat(e.target.value)})} />
        <button type="submit">Add</button>
        {error && <div className="error">{error}</div>}
      </form>
      <table>
        <thead><tr><th>SKU</th><th>Name</th><th>Price</th><th>Stock</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.sell_price}</td><td>{p.stock_qty}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}