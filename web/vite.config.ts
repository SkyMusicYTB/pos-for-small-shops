import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/products': 'http://localhost:8000',
      '/sales': 'http://localhost:8000',
      '/reports': 'http://localhost:8000',
      '/alerts': 'http://localhost:8000',
      '/users': 'http://localhost:8000'
    }
  }
})