# CF Tools — 开发人员工具站

基于 React + Vite + Tailwind CSS，部署到 Cloudflare Pages 的开发者工具集合。

## 功能模块

| 模块 | 说明 |
|------|------|
| JSON 工具 | 格式化、压缩、Diff 对比 |
| Base64 | 文本/文件 Base64 编解码 |
| URL 编解码 | encodeURIComponent / decode |
| 时间戳 | Unix ↔ 可读日期，支持时区 |
| UUID 生成 | 批量生成 v4 UUID |
| Hash 计算 | MD5/SHA1/SHA256/SHA512 |
| Regex 测试 | 实时高亮匹配，显示捕获组 |
| Markdown 预览 | 左编辑右预览，GFM + 代码高亮 |
| HTTP 构建器 | 生成 curl 命令和 fetch 代码 |
| JWT 解析 | 解析 Header/Payload，显示过期状态 |
| CSS 工具 | 格式化美化，px↔rem/vw 换算 |
| CRON 解析 | 自然语言描述 + 最近5次执行时间 |
| Diff 对比 | 行级/字符级文本对比 |
| 颜色转换 | HEX ↔ RGB ↔ HSL |

## 本地开发

```bash
npm install
npm run dev
```

## 部署到 Cloudflare Pages

### 方法一：wrangler CLI（推荐）

```bash
# 1. 登录 Cloudflare（浏览器授权）
npx wrangler login

# 2. 构建并部署
npm run cf:deploy
```

### 方法二：设置 API Token 部署（无需浏览器）

```powershell
$env:CLOUDFLARE_API_TOKEN = "your-token-here"
$env:CLOUDFLARE_ACCOUNT_ID = "0b27a92fdf61664e580d682c347ff2be"
npm run cf:deploy
```

### 方法三：使用 CF Pages CI/CD

将代码推送到 GitHub，在 Cloudflare Dashboard 连接仓库：
- Build command: `npm run build`
- Build output directory: `dist`
