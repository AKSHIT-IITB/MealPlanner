import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',  // Express backend
      '/ai-api': 'http://localhost:8000',   // FastAPI AI service
    },
  },
});
