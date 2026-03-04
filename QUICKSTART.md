# 🚀 快速部署指南

## 方式 1：自动化脚本（推荐）

```bash
# 运行设置脚本
bash setup-github.sh YOUR_GITHUB_USERNAME

# 按照脚本提示操作即可
```

脚本会自动帮你：
- ✅ 检查 Git 状态
- ✅ 提交未提交的更改
- ✅ 配置远程仓库
- ✅ 推送代码到 GitHub

## 方式 2：手动操作

### Step 1: 在 GitHub 创建仓库

访问 https://github.com/new 创建新仓库：

- **Repository name**: `ai-feed`
- **Visibility**: Public
- ❌ **不要**勾选任何初始化选项（README、.gitignore、License）
- 点击 **Create repository**

### Step 2: 推送代码

```bash
# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/ai-feed.git

# 推送代码
git push -u origin main
```

### Step 3: 部署到 Vercel

#### 方式 A：通过 Vercel 网站

1. 访问 https://vercel.com
2. 点击 "Add New" → "Project"
3. Import 你的 GitHub 仓库 `ai-feed`
4. 保持默认配置，点击 "Deploy"
5. 等待 1-2 分钟，获得部署 URL

#### 方式 B：使用 Vercel CLI（更快）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署（首次会要求登录）
vercel

# 按提示操作：
# ? Set up and deploy "~/ai-feed"? [Y/n] y
# ? Which scope? [选择你的账号]
# ? Link to existing project? [N/y] n
# ? What's your project's name? ai-feed
# ? In which directory is your code located? ./

# 部署成功后会显示 URL
```

## 配置 CI/CD 自动部署

如果希望 GitHub 自动部署到 Vercel（push 到 main 分支自动部署），需要配置 Secrets：

### 1. 获取 Vercel Token

```bash
# 访问 https://vercel.com/account/tokens
# 创建新 Token，命名为 "GitHub Actions"
```

### 2. 获取项目信息

```bash
# 运行一次 vercel 后，查看项目信息
cat .vercel/project.json

# 输出示例：
# {
#   "orgId": "team_xxxxx",
#   "projectId": "prj_xxxxx"
# }
```

### 3. 添加 GitHub Secrets

访问仓库 Settings → Secrets and variables → Actions，添加：

| Secret Name | Value | 获取方式 |
|------------|-------|---------|
| `VERCEL_TOKEN` | token_xxxxx | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | team_xxxxx | 查看 `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | prj_xxxxx | 查看 `.vercel/project.json` |

### 4. 测试自动部署

```bash
# 修改任意文件
echo "// test CI/CD" >> app/page.tsx

# 提交并推送
git add .
git commit -m "test: CI/CD 自动部署"
git push

# 访问 GitHub Actions 标签页查看部署进度
# 访问 https://github.com/YOUR_USERNAME/ai-feed/actions
```

## 验证部署

部署完成后：

1. ✅ 访问你的 Vercel URL（例如：https://ai-feed.vercel.app）
2. ✅ 检查页面是否正常加载
3. ✅ 点击"刷新"按钮，确认 RSS 数据能正常抓取
4. ✅ 查看 GitHub Actions，确认 CI 流程通过

## 常见问题

### Q1: git push 失败，提示需要认证？

**解决方案 1: 使用 Personal Access Token**

```bash
# 1. 创建 Token: https://github.com/settings/tokens
# 2. 权限勾选: repo (完整勾选)
# 3. 复制 Token
# 4. 推送时使用:
git push https://YOUR_TOKEN@github.com/YOUR_USERNAME/ai-feed.git
```

**解决方案 2: 配置 SSH（推荐）**

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 添加到 GitHub: https://github.com/settings/keys
cat ~/.ssh/id_ed25519.pub  # 复制内容

# 3. 修改远程 URL
git remote set-url origin git@github.com:YOUR_USERNAME/ai-feed.git

# 4. 推送
git push -u origin main
```

### Q2: Vercel 部署失败？

检查：
- ✅ Node.js 版本（项目使用 Node 20）
- ✅ 依赖是否正确安装（`npm ci`）
- ✅ 构建命令：`npm run build`
- ✅ 输出目录：`.next`

查看详细日志：Vercel Dashboard → 项目 → Deployments → 点击失败的部署

### Q3: RSS 数据加载失败？

- ✅ 检查网络连接
- ✅ 某些 RSS 源可能偶尔失败（已做容错处理）
- ✅ 查看浏览器控制台错误
- ✅ 检查 `/api/collect` 接口响应

## 🎉 完成！

恭喜！你的 AI 信息聚合网站已成功部署。

**分享你的项目：**
- 🌐 在线地址：https://YOUR-PROJECT.vercel.app
- 📦 GitHub 仓库：https://github.com/YOUR_USERNAME/ai-feed
- 🌟 别忘了给项目加个 Star！

## 下一步

- [ ] 自定义域名（Vercel Dashboard → Domains）
- [ ] 添加 Google Analytics
- [ ] 优化 RSS 源列表
- [ ] 实现标签筛选功能
- [ ] 添加搜索功能
- [ ] 启用缓存提升性能

---

**需要帮助？**
- 📖 查看完整文档：[GITHUB_SETUP.md](./GITHUB_SETUP.md)
- 🐛 报告问题：[GitHub Issues](https://github.com/YOUR_USERNAME/ai-feed/issues)
- 💡 功能建议：[Feature Request](https://github.com/YOUR_USERNAME/ai-feed/issues/new?template=feature_request.yml)
