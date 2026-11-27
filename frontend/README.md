# 食光记 · Vue 版

`recipe-community` 的前端 VUE 重写版，功能与旧版（`public/` 原生 JS）保持一致，共用同一套 Express API。

## 运行

```bash
# 终端 1：后端（必须显式指定 3000，server.js 默认是 80）
cd recipe-community
PORT=3000 npm start

# 终端 2：Vue
cd recipe-community/frontend
npm install
npm run dev        # http://localhost:5173
```

`/api`、`/images`、`/uploads` 由 Vite 代理到 `http://localhost:3000`，可用 `VITE_API_TARGET` 覆盖。

构建、预览与发布：

```bash
npm run build
npm run preview    # http://localhost:4173（同样带代理，需要后端在跑）
npm run publish    # 构建并写入 ../public，之后 npm start 的 3000 端口即为 Vue 版
```

`npm run publish` 会把 `dist/` 的 `index.html` 与 `assets/` 同步到后端静态目录 `public/`（图片与上传目录不动），旧版原生前端备份在项目根的 `legacy-frontend/`。

演示账号：`xiaoyu / 123456`、管理员 `admin / admin123`。

## 结构

- `src/views/` 页面：首页、发现、热门、详情、发布/编辑、个人中心、后台四个页面（概览/审核/全部菜谱/用户管理）
- `src/components/` 头部/页脚、卡片、弹窗（登录、审核、封号、确认、灯箱）、图表等
- `src/stores/` Pinia：auth / meta / toast / ui
- `src/api/client.js` fetch 封装（Bearer token、统一错误）
- `src/assets/style.css` 原版样式原样复用；`overrides.css` 仅做 Vue 挂载适配

## 当前状态

- **默认部署已切换为 Vue 版**：构建产物发布在 `public/`，`PORT=3000 npm start` 打开的就是 Vue 页面；`public/css`、`public/js` 等旧版代码已移除，完整备份在 `legacy-frontend/`。
- 在 3000 端口做过冒烟回归 7/7：首页、发现菜谱、登录态与后台入口、后台用户管理、JS/CSS 资源加载、SPA 回退均正常，控制台错误与运行时异常为 0。
- `npm run build` 通过。
- 已用无头 Edge 跑过主要页面：首页、发现/筛选、热门、详情、个人中心、发布表单、后台概览/审核队列/全部菜谱、登录弹窗、404，均正常渲染，无运行时异常。
- 端到端回归 9/9 通过：登录态校验、详情页点赞/取消赞（UI 计数与接口同步）、刷新后状态保持、普通用户投稿进入待审核、管理员通过审核后队列实时清零；控制台错误与运行时异常均为 0。
- 修复过一个真实 bug：`useRecipeActions` 原先把**原始对象**存进 `tracked`，`patchRecipe` 直接修改原始对象会绕过 Vue 响应式代理，导致详情页点赞接口成功但界面不更新。现改为存 `reactive()` 代理（同一原始对象复用同一代理），点赞/收藏在详情页与各列表间都能即时同步。

## 管理员封号 / 解封

- 后端新增 `GET /api/admin/users`、`POST /api/admin/users/:id/ban`、`POST /api/admin/users/:id/unban`；封禁字段与审计记录（`moderationLogs`）写入 `data/db.json`。
- 封禁只暂停登录与写操作（发布/编辑/删除/上传/点赞/收藏/评论/个人中心），已发布的菜谱和评论继续公开展示；封禁原因选填（200 字）、仅后台可见、解封时清除。
- 所有校验都在**每次请求查 DB 时**执行（token 是无状态 HMAC，没有 session 表）：被封用户登录 403、旧 token 访问 `/api/auth/me` 与写接口 403，前端刷新后自动清理本地会话。
- 后台「用户管理」页支持按状态筛选（全部/正常/已封禁）与用户名/昵称搜索，展示作品/留言计数和封禁信息；封号走弹窗填写原因，解封走确认框。封禁原因全程用插值渲染，不经过 `v-html`。
- E2E 回归 20/20 通过：UI 封号/解封、XSS 原因按纯文本展示、被封登录与写操作 403、已发布内容仍公开、重复封禁 409、封自己 400、管理员不出现在列表中、解封后登录与写操作恢复；控制台错误与运行时异常均为 0。

## 布局修复

- 移动端抽屉原先渲染在 `.site-header` 内，头部的 `backdrop-filter` 使它相对头部定位，收起时的平移把文档撑到 1802px，所有页面都出现横向滚动条。现用 `Teleport` 把抽屉挂到 `body`，桌面与移动端的横向溢出均消失。
- 后台表格表头里的 `.visually-hidden` 是绝对定位，窄屏下宽表格在卡片内横向滚动时会以页面为基准撑宽文档（用户管理 667px、全部菜谱 514px）。给 `.admin-table th/td` 加 `position: relative` 后，六个主要页面在 390px 宽度下均无页面级横向溢出。

验证用的临时用户、投稿、评论、封禁记录与点赞改动已全部回滚，`data/db.json` 恢复为原始演示数据。`public/` 旧版前端未改动。未提交到 git。
