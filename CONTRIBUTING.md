# 贡献指南

感谢你考虑为 AI 信息聚合项目做出贡献！

## 开发流程

### 1. Fork 项目

点击右上角的 Fork 按钮，将项目 fork 到你的账号下。

### 2. 克隆仓库

```bash
git clone https://github.com/你的用户名/ai-feed.git
cd ai-feed
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 4. 安装依赖

```bash
npm install
```

### 5. 开发

```bash
npm run dev
```

访问 http://localhost:3000 查看效果。

### 6. 代码规范

在提交前确保：

```bash
# Lint 检查
npm run lint

# 类型检查
npx tsc --noEmit

# 构建测试
npm run build
```

### 7. 提交代码

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复某个 bug"
git commit -m "docs: 更新文档"
git commit -m "style: 代码格式化"
git commit -m "refactor: 代码重构"
git commit -m "perf: 性能优化"
git commit -m "test: 添加测试"
git commit -m "chore: 构建配置"
```

### 8. 推送到 GitHub

```bash
git push origin feature/your-feature-name
```

### 9. 创建 Pull Request

1. 访问你的 fork 仓库页面
2. 点击 "Compare & pull request"
3. 填写 PR 模板
4. 等待 CI 检查通过
5. 等待审核

## 代码风格

- 使用 TypeScript
- 使用 Tailwind CSS
- 遵循 ESLint 规则
- 组件使用函数式组件
- 优先使用 React Hooks

## 添加新的 RSS 源

编辑 `lib/sources.ts`：

```typescript
{
  name: '源名称',
  rssUrl: 'https://example.com/feed.xml',
  category: '分类',
  tags: ['标签1', '标签2']
}
```

## 目录结构

```
ai-feed/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── layout.tsx         # 布局
│   └── page.tsx           # 主页
├── lib/                   # 工具库
│   └── sources.ts         # RSS 源配置
├── .github/               # GitHub 配置
│   ├── workflows/         # CI/CD
│   └── ISSUE_TEMPLATE/    # Issue 模板
└── public/                # 静态资源
```

## 问题反馈

- 使用 [Bug Report](https://github.com/你的用户名/ai-feed/issues/new?template=bug_report.yml) 模板报告 Bug
- 使用 [Feature Request](https://github.com/你的用户名/ai-feed/issues/new?template=feature_request.yml) 模板提出功能建议

## 行为准则

- 尊重所有贡献者
- 使用友好和包容的语言
- 接受建设性的批评
- 关注对社区最有利的事情

## License

MIT License
