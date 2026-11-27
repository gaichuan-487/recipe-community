/**
 * 把 vite build 的产物发布到后端的 public/ 目录，让 `npm start` 直接提供 Vue 版页面。
 * 旧版原生前端已备份在项目根的 legacy-frontend/，public/ 下只保留图片与上传目录。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(frontendDir, 'dist');
const publicDir = path.resolve(frontendDir, '..', 'public');

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('找不到 frontend/dist/index.html，请先运行 npm run build。');
  process.exit(1);
}

fs.mkdirSync(publicDir, { recursive: true });
fs.rmSync(path.join(publicDir, 'assets'), { recursive: true, force: true });
fs.cpSync(path.join(distDir, 'assets'), path.join(publicDir, 'assets'), { recursive: true });
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(publicDir, 'index.html'));

console.log('已发布到 public/：浏览器访问后端端口即可打开 Vue 版页面。');
