#!/bin/bash

# AI Feed - GitHub 仓库创建和推送脚本
# 使用方法：bash setup-github.sh YOUR_GITHUB_USERNAME

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI Feed - GitHub 仓库设置脚本      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# 检查是否提供了用户名
if [ -z "$1" ]; then
  echo -e "${YELLOW}请提供你的 GitHub 用户名：${NC}"
  read -p "> " GITHUB_USERNAME
else
  GITHUB_USERNAME=$1
fi

REPO_NAME="ai-feed"
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo -e "${BLUE}📋 配置信息：${NC}"
echo -e "  GitHub 用户名: ${GREEN}$GITHUB_USERNAME${NC}"
echo -e "  仓库名称: ${GREEN}$REPO_NAME${NC}"
echo -e "  仓库 URL: ${GREEN}$REPO_URL${NC}"
echo ""

# 步骤 1：检查 Git 状态
echo -e "${BLUE}[1/5]${NC} 检查 Git 状态..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${RED}❌ 错误：当前目录不是 Git 仓库${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Git 仓库正常"

# 步骤 2：检查是否有未提交的更改
echo -e "${BLUE}[2/5]${NC} 检查待提交更改..."
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}⚠ 有未提交的更改${NC}"
  git status -s
  echo ""
  read -p "是否提交这些更改? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    read -p "提交信息: " commit_msg
    git commit -m "$commit_msg"
    echo -e "${GREEN}✓${NC} 更改已提交"
  fi
else
  echo -e "${GREEN}✓${NC} 无待提交更改"
fi

# 步骤 3：创建 GitHub 仓库
echo ""
echo -e "${BLUE}[3/5]${NC} 创建 GitHub 仓库..."
echo -e "${YELLOW}请按照以下步骤在 GitHub 上创建仓库：${NC}"
echo ""
echo "  1. 访问: ${GREEN}https://github.com/new${NC}"
echo "  2. Repository name: ${GREEN}$REPO_NAME${NC}"
echo "  3. 选择: ${GREEN}Public${NC}"
echo "  4. ❌ ${RED}不要${NC} 勾选 'Add a README file'"
echo "  5. ❌ ${RED}不要${NC} 勾选 'Add .gitignore'"
echo "  6. ❌ ${RED}不要${NC} 选择 'Choose a license'"
echo "  7. 点击 ${GREEN}'Create repository'${NC}"
echo ""
read -p "完成后按回车继续..." 

# 步骤 4：添加远程仓库
echo -e "${BLUE}[4/5]${NC} 配置远程仓库..."
if git remote | grep -q "^origin$"; then
  echo -e "${YELLOW}⚠ 远程仓库 'origin' 已存在${NC}"
  CURRENT_URL=$(git remote get-url origin)
  echo -e "  当前 URL: $CURRENT_URL"
  read -p "是否更新为新 URL? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git remote set-url origin "$REPO_URL"
    echo -e "${GREEN}✓${NC} 远程仓库 URL 已更新"
  fi
else
  git remote add origin "$REPO_URL"
  echo -e "${GREEN}✓${NC} 远程仓库已添加"
fi

# 步骤 5：推送代码
echo -e "${BLUE}[5/5]${NC} 推送代码到 GitHub..."
echo ""
read -p "是否立即推送代码? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}正在推送...${NC}"
  if git push -u origin main; then
    echo ""
    echo -e "${GREEN}✓${NC} 代码推送成功！"
  else
    echo ""
    echo -e "${RED}❌ 推送失败${NC}"
    echo -e "${YELLOW}请检查：${NC}"
    echo "  1. 仓库是否已创建"
    echo "  2. GitHub 用户名是否正确"
    echo "  3. 是否有推送权限（可能需要配置 SSH 或 Personal Access Token）"
    echo ""
    echo "手动推送命令："
    echo -e "  ${GREEN}git push -u origin main${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}跳过推送${NC}"
  echo ""
  echo "稍后可使用以下命令推送："
  echo -e "  ${GREEN}git push -u origin main${NC}"
fi

# 完成
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 设置完成！               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 仓库地址：${NC}"
echo -e "   ${GREEN}https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
echo ""
echo -e "${BLUE}📋 后续步骤：${NC}"
echo "   1. 配置 GitHub Secrets（用于 CI/CD）"
echo "      参考: ${GREEN}GITHUB_SETUP.md${NC}"
echo ""
echo "   2. 部署到 Vercel"
echo "      参考: ${GREEN}DEPLOY.md${NC}"
echo ""
echo "   3. 配置分支保护（可选）"
echo "      Settings → Branches → Add rule"
echo ""
echo -e "${BLUE}🚀 快速部署：${NC}"
echo -e "   ${GREEN}npm i -g vercel && vercel${NC}"
echo ""
