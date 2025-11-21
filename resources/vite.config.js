import { defineConfig } from 'vite';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: './',
  base: '/resource-activation-site/',
  plugins: [
    tsconfigPaths()
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        feedback: resolve(__dirname, 'feedback.html'),
        resources: resolve(__dirname, 'resources.html'),
        security: resolve(__dirname, 'security.html'),
        status: resolve(__dirname, 'status.html'),
        toolbox: resolve(__dirname, 'toolbox.html')
      },
      output: {
        manualChunks: {
          vendor: ['axios', 'lodash-es', 'date-fns']
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
