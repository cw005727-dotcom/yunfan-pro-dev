import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8506',
        changeOrigin: true,
        headers: {
          'X-Admin-Token': 'YUNFAN_ADMIN_2026',
        },
      },
      '/admin_api': {
        target: 'http://localhost:8506',
        changeOrigin: true,
        headers: {
          'X-Admin-Token': 'YUNFAN_ADMIN_2026',
        },
      },
    },
  },
  define: {
    // 注入 admin 专用 Token（生产环境从环境变量读取）
    ADMIN_TOKEN: JSON.stringify(process.env.ADMIN_TOKEN || 'dev-admin-token'),
  },
});
