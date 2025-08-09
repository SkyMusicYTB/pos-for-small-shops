import React, { useEffect, useState } from 'react'
import { api } from '../store/auth'

function fmt(d: Date) { return d.toISOString().slice(0,10) }

export default function Dashboard() {
  const [start, setStart] = useState(fmt(new Date(Date.now()-7*86400*1000)))
  const [end, setEnd] = useState(fmt(new Date()))
  const [data, setData] = useState<any | null>(null)

  const load = async () => {
    const { data } = await api.get('/reports/dashboard', { params: { start: start + 'T00:00:00', end: end + 'T23:59:59' } })
    setData(data)
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <div className="grid">
        <input type="date" value={start} onChange={e=>setStart(e.target.value)} />
        <input type="date" value={end} onChange={e=>setEnd(e.target.value)} />
        <button onClick={load}>Refresh</button>
      </div>
      {data && (
        <div className="kpis">
          <div>Total Sales: ${data.total_sales.toFixed(2)}</div>
          <div>Gross Profit: ${data.gross_profit.toFixed(2)}</div>
          <div>ROI: {data.roi ? (data.roi*100).toFixed(1)+'%' : 'N/A'}</div>
        </div>
      )}
    </div>
  )
}