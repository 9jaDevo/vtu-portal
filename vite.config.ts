import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    watch: {
      ignored: [
        '**/data/**',
        '**/logs/**',
        '**/server/dist/**',
        '**/*.sqlite',
        '**/*.sqlite-*',
        '**/*.log'
      ]
    }
  }
});