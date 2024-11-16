// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/patients': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      define: {
        'process.env': {}
      },
      server: {
        watch: {
          usePolling: true,
        },
    },
    plugins: [react()],
    server: {
      port: 5173,
      host: true
    }
      
      // Add more endpoints if needed
    }
  }
});
