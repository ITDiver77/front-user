import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9556,
    host: true,
    allowedHosts: ['srv9.mythservers.abrdns.com'],
    // Performance optimizations
    hmr: {
      overlay: true,
    },
    // Increase timeout for slower networks
    timeout: 30000,
    // Optimize deps
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@mui/material', 'axios'],
    },
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Production optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-utils': ['axios', 'date-fns', 'zod'],
        },
      },
    },
    // Minification
    minify: 'esbuild',
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Dependencies optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@emotion/react', '@emotion/styled', 'axios'],
  },
})
