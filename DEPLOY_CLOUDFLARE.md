# TextCard - Cloudflare Pages 静态部署指南

本项目已配置为**纯静态网站架构（Pure Static Site）**，所有页面、逻辑、排版与 Rust WASM 引擎均在浏览器客户端运行，无需任何 Node.js 服务器。

---

## 方式一：通过 GitHub 仓库自动部署（推荐）

1. 将代码推送到您的 GitHub / GitLab 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3. 选择包含本项目的仓库。
4. 在构建配置（Build settings）中填入：
   - **Framework preset**: `None` 或 `Next.js (Static HTML Export)`
   - **Build command**: `cd web && npm run build` (如果是以 `textcard` 为根目录) 或直接 `npm run build` (如果以 `textcard/web` 为根目录)
   - **Build output directory**: `web/out` (或以 web 为根目录时的 `out`)
   - **Root directory**: `textcard/web` (可选，推荐直接将根目录设为 `textcard/web`)
5. 点击 **Save and Deploy** 即可完成部署！

---

## 方式二：使用 Wrangler 命令行直接一键上传部署

如果您本地已经安装了 Wrangler CLI，只需两步即可完成部署：

```bash
# 1. 切换到前端目录并构建静态产物
cd textcard/web
npm run build

# 2. 一键上传到 Cloudflare Pages
npx wrangler pages deploy out --project-name=textcard
```

首次运行会自动提示登录 Cloudflare 账号，完成后会立即分配一个 `https://textcard.pages.dev` 的专属公网域名。

---

## 静态化技术亮点与优化

1. **零服务端依赖**：
   - 构建产物全为静态文件（位于 `out/` 目录），包含 `index.html`、`_headers`、CSS、JS 以及 `pkg/textcard_wasm_bg.wasm`。
2. **自动化 MIME 类型与边缘缓存**：
   - 内置了 `_headers` 配置文件，确保 Cloudflare CDN 边缘节点向客户端分发 `.wasm` 文件时携带 `Content-Type: application/wasm` 及长效缓存头 `max-age=31536000, immutable`。
3. **纯前端文章提取**：
   - 采用浏览器直连 Jina Reader API 与公共 CORS 代理降级，突破浏览器跨域限制，在纯静态页面中依然能够一键抓取微信公众号、知乎、语雀、Medium 的文章正文。
