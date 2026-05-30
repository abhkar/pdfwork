import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-router-dom', 'zustand', 'zustand/react', 'framer-motion', 'react-dropzone'],
    exclude: ['pdfjs-dist'],
  },
  worker: {
    format: 'es',
  },
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
})
