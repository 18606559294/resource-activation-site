import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  base: '/resource-activation-site/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        feedback: resolve(__dirname, 'feedback.html'),
        resources: resolve(__dirname, 'resources.html'),
        security: resolve(__dirname, 'security.html'),
        status: resolve(__dirname, 'status.html'),
        toolbox: resolve(__dirname, 'toolbox.html')
      }
    }
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true
  }
});