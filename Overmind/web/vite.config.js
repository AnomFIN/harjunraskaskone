import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/s': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/files': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
