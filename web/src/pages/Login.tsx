import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Login() {
  const [email, setEmail] = useState('owner@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try { await login(email, password); navigate('/') } catch (e: any) { setError(e?.response?.data?.detail || 'Login failed') }
  }

  return (
    <div className="center">
      <form onSubmit={submit} className="card">
        <h1>Login</h1>
        {error && <div className="error">{error}</div>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}