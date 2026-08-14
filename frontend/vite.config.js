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
        entryFileNames: 'assets/entry-[hash].js',
        chunkFileNames: 'assets/chunk-[hash].js',
        assetFileNames: 'assets/asset-[name]-[hash][extname]',
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
          if (id.includes('redux') || id.includes('react-redux') || id.includes('@reduxjs')) return 'vendor-state';
          if (id.includes('axios') || id.includes('formik') || id.includes('yup') || id.includes('framer-motion') || id.includes('jspdf')) return 'vendor-utils';
          return 'vendor';
        }
      }
    }
  }
})