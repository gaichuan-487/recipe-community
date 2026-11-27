import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Express 后端地址；后端默认端口是 80，演示时请用 PORT=3000 启动。
const target = process.env.VITE_API_TARGET || 'http://localhost:3000';

const proxy = {
  '/api': { target, changeOrigin: true },
  '/images': { target, changeOrigin: true },
  '/uploads': { target, changeOrigin: true }
};

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy
  },
  preview: {
    port: 4173,
    proxy
  }
});
