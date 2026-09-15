# TextCard 📝✨

> 将文本作品（散文、小说、诗歌、读书笔记、博客）一键转化为适合社交媒体分享的高颜值视觉卡片。基于 **Rust + Typst WASM** 排版引擎，全静态架构，支持零服务端部署至 Cloudflare Pages。

---

## 🌟 核心特性

- 🦀 **Rust + Typst 0.15 WASM 渲染引擎**：
  - 纯客户端离屏渲染，毫秒级排版与 2x Retina 高清输出。
  - 内置出版级中文排版规范：标点避头尾（禁则处理）、中英文自动间距、段落两端对齐。
- 🎨 **多风格模板矩阵**：
  - **文学纸张**：温润宣纸质感、首行缩进、优雅衬线体、作者尾字朱砂印章。
  - **小红书干货**：3:4 比例、撞色醒目标题栏、序号清单、现代无衬线体。
  - **极简暗黑**：1:1 比例、深黑夜间模式、蓝色高亮，专为 Twitter / X 观点卡片设计。
  - **复古报纸**：泛黄新闻纸、复古报头双线、头条粗体与双栏排版。
- 🔗 **全静态 URL 一键提取**：
  - 支持直接粘贴**微信公众号、知乎专栏/回答、语雀、Medium** 链接。
  - 纯前端结合 Jina Reader API 与 CORS 降级代理，绕过反爬与跨域限制，自动提取标题、作者与正文 Markdown。
- ⚡ **100% 纯静态架构**：
  - 采用 Next.js 静态导出 (`output: 'export'`)。
  - 无需任何 Node.js 服务器，可无缝部署于 **Cloudflare Pages**、GitHub Pages、Vercel 等。

---

## 📂 项目结构

```
textcard/
├── Cargo.toml                  # Rust workspace 配置
├── crates/
│   └── textcard-wasm/          # Rust WASM 核心（Typst 0.15 + tiny-skia 渲染）
├── templates/                  # Typst 排版模板
│   ├── literary-paper.typ      # 文学纸张风
│   ├── xiaohongshu.typ         # 小红书干货风
│   ├── minimal-dark.typ        # 极简暗黑风
│   └── newspaper.typ           # 复古报纸风
├── web/                        # Next.js 纯静态前端
│   ├── app/                    # 页面与全局样式
│   ├── components/             # 编辑器、主题选择、预览、导出组件
│   ├── lib/                    # WASM 桥接、浏览器端文章提取器
│   ├── pkg/                    # wasm-pack 生成的 NPM/WASM 包
│   └── public/                 # 静态资源及 _headers 缓存配置
└── DEPLOY_CLOUDFLARE.md        # Cloudflare Pages 详细部署文档
```

---

## 🚀 本地开发

### 1. 运行前端

```bash
cd web
npm install
npm run dev
```

在浏览器访问 `http://localhost:3000` 即可开始使用。

### 2. 重新编译 WASM（可选）

如果您修改了 `crates/textcard-wasm` 或 `templates/`，可使用 `wasm-pack` 重新构建：

```bash
# 安装 wasm-pack（若未安装）
cargo install wasm-pack

# 构建 WASM 产物至 web/pkg
wasm-pack build crates/textcard-wasm --target web --out-dir ../../web/pkg --release --no-opt

# 同步 WASM 静态文件
cp web/pkg/textcard_wasm_bg.wasm web/public/pkg/
```

---

## ☁️ 部署到 Cloudflare Pages

1. 在 Cloudflare Dashboard 中创建 Pages 项目并绑定本仓库。
2. 配置构建参数：
   - **Root directory**: `web`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
3. 保存并部署即可在全球 CDN 上线。

详细步骤参见 [DEPLOY_CLOUDFLARE.md](./DEPLOY_CLOUDFLARE.md)。

---

## 📄 License

MIT License
