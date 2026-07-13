import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/rashi/',
  plugins: [react()],
  server: {
    proxy: {
      '/rashi/api': {
        target: 'http://localhost:8090',
        rewrite: (p) => p.replace(/^\/rashi\/api/, '/api'),
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
