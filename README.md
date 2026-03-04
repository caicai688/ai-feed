# AI 信息聚合

实时聚合 AI 领域顶级信源的最新资讯

## 功能特性

- 📰 聚合 10+ AI 领域权威信源
- 🔄 实时抓取 RSS 数据
- 🎨 现代化卡片式 UI
- ⚡ Next.js 15 + TypeScript + Tailwind CSS
- 🚀 一键部署到 Vercel

## 信源列表

- Anthropic Blog
- OpenAI Blog
- MIT Technology Review AI
- The Rundown AI
- TLDR AI
- Hugging Face Blog
- Google AI Blog
- Meta AI Blog
- DeepMind Blog
- Towards Data Science

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 部署到 Vercel

1. 推送代码到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 导入 GitHub 仓库
4. 自动部署完成！

或使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **RSS**: rss-parser
- **部署**: Vercel

## API 端点

- `GET /api/collect` - 抓取所有信源的最新资讯

## 项目结构

```
ai-feed/
├── app/
│   ├── api/collect/
│   │   └── route.ts      # RSS 抓取 API
│   ├── layout.tsx         # 布局组件
│   └── page.tsx           # 主页面
├── lib/
│   └── sources.ts         # 信源配置
└── package.json
```

## License

MIT
