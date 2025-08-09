import { create } from 'zustand'
import axios from 'axios'
import { enqueue, replayQueue, isOnline } from '../utils/offline'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: any | null
  business: any | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
  loadMe: () => Promise<void>
}

export const api = axios.create({ baseURL: '' })

window.addEventListener('online', () => {
  replayQueue(async (r) => api.request({ method: r.method as any, url: r.url, data: r.body, headers: r.headers }))
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (!isOnline() && (config.method === 'post' || config.method === 'put' || config.method === 'delete')) {
    enqueue({ method: config.method!, url: config.url!, body: config.data, headers: config.headers })
    return Promise.reject({ message: 'queued_offline' })
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await useAuthStore.getState().refresh()
        return api(original)
      } catch {
        useAuthStore.getState().logout()
      }
    }
    return Promise.reject(err)
  }
)

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem('access') ,
  refreshToken: localStorage.getItem('refresh'),
  user: null,
  business: null,
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    set({ accessToken: data.access_token, refreshToken: data.refresh_token })
    localStorage.setItem('access', data.access_token)
    localStorage.setItem('refresh', data.refresh_token)
    await get().loadMe()
  },
  logout() {
    localStorage.removeItem('access'); localStorage.removeItem('refresh')
    set({ accessToken: null, refreshToken: null, user: null, business: null })
  },
  async refresh() {
    const rt = get().refreshToken
    if (!rt) throw new Error('no refresh')
    const { data } = await api.post('/auth/refresh', { refresh_token: rt })
    set({ accessToken: data.access_token, refreshToken: data.refresh_token })
    localStorage.setItem('access', data.access_token)
    localStorage.setItem('refresh', data.refresh_token)
  },
  async loadMe() {
    const { data } = await api.get('/users/me')
    set({ user: data.user, business: data.business })
  }
}))