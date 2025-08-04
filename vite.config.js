import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration optimisée pour Vercel et hébergements modernes
export default defineConfig({
  plugins: [react()],
  // Retiré base: './' pour compatibilité Vercel
  // (Gardé pour O2switch dans build séparé si nécessaire)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Plus rapide et fiable que terser
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          charts: ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    host: true
  }
})