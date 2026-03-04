# GitHub 仓库设置指南

## 1️⃣ 创建 GitHub 仓库

在 GitHub 上创建新仓库：

```bash
# 方式 1：通过 GitHub CLI（推荐）
gh repo create ai-feed --public --source=. --remote=origin --push

# 方式 2：通过 Web 界面
# 访问 https://github.com/new
# 填写仓库名称：ai-feed
# 选择 Public
# 不要初始化 README（本地已有）
# 创建后复制仓库 URL
```

## 2️⃣ 推送代码到 GitHub

如果使用方式 2（Web 界面），需要手动推送：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/ai-feed.git

# 推送代码
git push -u origin main
```

## 3️⃣ 配置 GitHub Secrets（用于 CI/CD）

### 获取 Vercel Token

1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 命名为 "GitHub Actions"
4. 复制 Token

### 获取 Vercel 项目 ID

首先部署一次项目到 Vercel：

```bash
npm i -g vercel
vercel
```

然后在项目根目录查看 `.vercel/project.json`：

```bash
cat .vercel/project.json
```

会看到：
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

### 添加 Secrets 到 GitHub

1. 访问仓库页面：https://github.com/YOUR_USERNAME/ai-feed
2. Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. 添加以下 Secrets：

| Name | Value | 说明 |
|------|-------|------|
| `VERCEL_TOKEN` | token_xxxxx | Vercel Token |
| `VERCEL_ORG_ID` | team_xxxxx | 组织 ID |
| `VERCEL_PROJECT_ID` | prj_xxxxx | 项目 ID |

## 4️⃣ 启用 GitHub Actions

1. 访问仓库的 Actions 标签页
2. 如果首次使用，点击 "I understand my workflows, go ahead and enable them"
3. GitHub Actions 会自动运行

## 5️⃣ 配置分支保护（可选但推荐）

1. Settings → Branches
2. 点击 "Add rule"
3. Branch name pattern: `main`
4. 勾选以下选项：
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - 选择：`lint`, `build`
   - ✅ Require branches to be up to date before merging
5. 点击 "Create"

## 6️⃣ 测试 CI/CD 流程

### 测试自动化检查

```bash
# 创建新分支
git checkout -b test/ci-cd

# 修改文件
echo "// test" >> app/page.tsx

# 提交并推送
git add .
git commit -m "test: CI/CD 流程测试"
git push origin test/ci-cd

# 在 GitHub 创建 PR，观察 Actions 运行
```

### 测试自动部署

```bash
# 切换回 main 分支
git checkout main

# 合并 PR 或直接推送
git push origin main

# 观察 Actions 自动部署到 Vercel
```

## 7️⃣ 验证部署

1. 访问 Actions 标签页，查看工作流运行状态
2. 访问 Vercel 仪表板，查看部署状态
3. 访问部署 URL，验证网站运行正常

## 🎉 完成！

现在你的项目已经配置好完整的 CI/CD 流程：

- ✅ 代码推送自动触发 CI 检查
- ✅ PR 自动创建预览环境
- ✅ 合并到 main 自动部署生产环境
- ✅ 安全扫描每周自动运行
- ✅ 依赖审查自动检查

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vercel 部署文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
