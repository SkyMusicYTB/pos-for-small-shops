import React, { useEffect, useState } from 'react'
import { api } from '../store/auth'
import { isOnline } from '../utils/offline'

export default function Sales() {
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<{product_id: string, qty: number}[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => { (async()=>{ const {data} = await api.get('/products'); setProducts(data) })() }, [])

  const add = (pid: string) => {
    setCart(prev => {
      const idx = prev.findIndex(i=>i.product_id===pid)
      if (idx>=0) { const c=[...prev]; c[idx].qty+=1; return c }
      return [...prev, {product_id: pid, qty: 1}]
    })
  }

  const createSale = async () => {
    setMessage(null)
    try {
      await api.post('/sales', { items: cart })
      setCart([])
      setMessage('Sale recorded')
    } catch (e: any) {
      setMessage(e?.response?.data?.detail || 'Error')
    }
  }

  const subtotal = cart.reduce((s, i)=>{
    const p = products.find(p=>p.id===i.product_id); return s + (p ? p.sell_price * i.qty : 0)
  }, 0)

  return (
    <div className="container">
      <h2>Sales</h2>
      {!isOnline() && <div className="error">Offline: you can add to cart but cannot finalize sales.</div>}
      {message && <div className="note">{message}</div>}
      <div className="grid">
        <div>
          <h3>Products</h3>
          <ul>
            {products.map(p => <li key={p.id}><button onClick={()=>add(p.id)}>+ Add</button> {p.name} (${p.sell_price})</li>)}
          </ul>
        </div>
        <div>
          <h3>Cart</h3>
          <ul>
            {cart.map(i=>{
              const p = products.find(p=>p.id===i.product_id)
              return <li key={i.product_id}>{p?.name} x <input type="number" value={i.qty} onChange={e=>setCart(cart.map(ci=>ci.product_id===i.product_id?{...ci, qty: parseInt(e.target.value||'0')}:ci))}/> </li>
            })}
          </ul>
          <div>Subtotal: ${subtotal.toFixed(2)}</div>
          <button disabled={!cart.length || !isOnline()} onClick={createSale}>Checkout (Cash)</button>
        </div>
      </div>
    </div>
  )
}