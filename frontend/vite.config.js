import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://booking-calendar-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});