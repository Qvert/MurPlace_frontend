import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const PROXY_TARGET = process.env.VITE_PROXY_TARGET || 'http://backend:8000'
const DEV_MODE = process.env.VITE_DEV_MODE === 'true'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    middlewares: DEV_MODE ? [
      (req, res, next) => {
        if (req.url.startsWith('/static')) {
          const filePath = path.join(process.cwd(), 'public', req.url.slice(1))
          if (fs.existsSync(filePath)) {
            return res.end(fs.readFileSync(filePath))
          }
        }
        next()
      }
    ] : [],
    proxy: {
      '/api': {
        target: PROXY_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // Serve Django static files through proxy if needed
      '/static': DEV_MODE ? undefined : {
        target: PROXY_TARGET,
        changeOrigin: true,
        secure: false
      },
      '/admin': {
        target: PROXY_TARGET,
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
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
