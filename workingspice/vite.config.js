import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000'  // Assuming your Express server runs on port 5000
    }
  },
  // Add a base path if your app isn't hosted at the root
  // base: '/',
})
