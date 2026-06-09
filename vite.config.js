import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from 'vite-plugin-remove-console'

// https://vitejs.dev/config/
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
    chunkSizeWarningLimit: 1000, // Set a higher or lower limit as needed
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const modulePath = id.toString().split('node_modules/')[1];
            if (!modulePath) return 'vendor';

            const parts = modulePath.split('/');
            const packageName = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
            if (packageName.includes('react')) return 'vendor-react';
            if (packageName.includes('axios') || packageName.includes('react-toastify') || packageName.includes('framer-motion')) {
              return 'vendor-utils';
            }
            return packageName;
          }
        }
      }
    }
  }
})