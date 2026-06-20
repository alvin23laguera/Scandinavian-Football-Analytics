import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/fotmob-images': {
        target: 'https://images.fotmob.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fotmob-images/, ''),
      },
      '/sportsdb-images': {
        target: 'https://r2.thesportsdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sportsdb-images/, ''),
      },
    },
  },
})
