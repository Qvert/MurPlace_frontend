import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PROXY_TARGET = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:5173'

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    proxy: {
      // Proxy API calls to Django dev server. Target can be overridden with VITE_PROXY_TARGET env var.
      '/api': {
        target: PROXY_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // Serve Django static files through proxy if needed
      '/static': {
        target: PROXY_TARGET,
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist/', 
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    }
  }
})
