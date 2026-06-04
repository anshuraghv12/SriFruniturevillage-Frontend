import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from 'vite-plugin-remove-console'

export default defineConfig({
  plugins: [
    react(),
    removeConsole()
  ],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000/',
    },
  },
  build: {
    chunkSizeWarningLimit: 1000
    // ❌ REMOVE rollupOptions completely
  }
})