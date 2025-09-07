import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // <-- important for correct relative paths in production
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://booking-calendar-backend.onrender.com/api',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
