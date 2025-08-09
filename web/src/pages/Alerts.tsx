import React, { useEffect, useState } from 'react'
import { api } from '../store/auth'

export default function Alerts() {
  const [items, setItems] = useState<any[]>([])
  useEffect(()=>{ (async()=>{ const {data}=await api.get('/alerts/low-stock'); setItems(data) })() }, [])
  return (
    <div className="container">
      <h2>Low Stock</h2>
      <ul>
        {items.map(i => <li key={i.id}>{i.name} (SKU {i.sku}): {i.stock_qty} <= {i.low_stock_threshold}</li>)}
      </ul>
    </div>
  )
}