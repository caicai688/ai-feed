# 新功能说明文档

## 🎉 已实现的新功能

### 1. 📊 按信源筛选

**功能描述**：
- 支持按信源（RSS、YouTube、Twitter）筛选内容
- 支持按标签筛选内容
- 可组合筛选（同时按信源和标签）
- 显示当前筛选状态和结果数量

**使用方法**：
1. 在页面顶部找到"信源筛选"和"标签筛选"下拉菜单
2. 选择想要查看的信源或标签
3. 点击"清除筛选"可重置所有筛选条件

**实现位置**：
- 前端：`app/page.tsx` - 筛选逻辑和UI
- 后端：无需额外API

---

### 2. 🌐 AI翻译中文版本

**功能描述**：
- 支持将英文内容翻译成中文
- 一键切换中英文显示
- 按需翻译，节省API调用
- 翻译结果缓存，避免重复翻译

**使用方法**：
1. 点击页面右上角的语言切换按钮（🌍 英文/🇨🇳 中文）
2. 切换到中文模式后，点击卡片上的"翻译"按钮
3. 翻译完成后自动显示中文内容

**技术实现**：
- API：`/api/translate`
- 翻译服务：MyMemory Translation API（免费）
- 缓存策略：24小时
- 可替换为其他翻译服务（Google Translate、DeepL等）

**注意事项**：
- 免费API有调用频率限制
- 生产环境建议使用付费翻译服务
- 可在环境变量中配置翻译API密钥

---

### 3. ▶️ YouTube 频道监控

**功能描述**：
- 监控5个AI领域顶级YouTube频道
- 自动抓取最新视频（每频道前5个）
- 提取视频字幕/文稿
- 显示视频缩略图
- 支持直接点击观看

**已配置频道**：
1. **OpenAI** - GPT、ChatGPT 官方演示
2. **Anthropic** - Claude AI 相关内容
3. **Google DeepMind** - AGI 研究进展
4. **Lex Fridman** - AI 领域深度访谈
5. **Two Minute Papers** - AI 论文可视化讲解

**配置文件**：`lib/social-sources.ts`

**添加新频道**：
```typescript
{
  id: 'yt-6',
  name: '频道名称',
  channelId: 'YouTube频道ID',
  tags: ['标签1', '标签2']
}
```

**如何获取频道ID**：
1. 访问YouTube频道页面
2. 查看URL中的 `channel/` 后面的ID
3. 例如：`https://youtube.com/channel/UCXZCJLdBC09xxGZ6gcdrc6A`
4. 频道ID为：`UCXZCJLdBC09xxGZ6gcdrc6A`

**技术实现**：
- API：`/api/youtube`
- RSS：YouTube RSS Feed
- 字幕：youtube-transcript 库
- 缓存：建议5-15分钟

---

### 4. 🐦 X/Twitter 账号监控

**功能描述**：
- 监控8个AI领域关键人物的推文
- 实时抓取最新动态（每账号10条）
- 自动解析推文内容
- 保留原始推文链接

**已配置账号**：
1. **Sam Altman** (@sama) - OpenAI CEO
2. **Dario Amodei** (@DarioAmodei) - Anthropic CEO
3. **Yann LeCun** (@ylecun) - Meta AI 首席科学家
4. **Andrew Ng** (@AndrewYNg) - AI教育领军人物
5. **Greg Brockman** (@gdb) - OpenAI CTO
6. **Andrej Karpathy** (@karpathy) - AI研究员
7. **Ilya Sutskever** (@ilyasut) - OpenAI 联合创始人
8. **Demis Hassabis** (@demishassabis) - DeepMind CEO

**配置文件**：`lib/social-sources.ts`

**添加新账号**：
```typescript
{
  id: 'x-9',
  name: '显示名称',
  username: 'twitter用户名',
  tags: ['标签1', '标签2']
}
```

**技术实现**：
- API：`/api/twitter`
- 数据源：Nitter RSS（Twitter开源前端）
- 备用实例：3个Nitter实例自动切换
- 缓存：5分钟

**注意事项**：
- Nitter实例可能不稳定，已配置多个备用
- 某些推文可能因隐私设置无法获取
- 推荐使用Twitter官方API（需要申请）

---

### 5. 📊 每日AI总结推荐

**功能描述**：
- 自动分析昨日所有AI资讯
- 智能选择最值得关注的5条内容
- 提取热门话题和趋势
- 生成每日总结报告

**显示内容**：
- 📅 日期和总体概况
- 🔥 热门话题（前8个）
- 📰 重点资讯（前5条，含推荐理由）
- 🔗 原文链接（可直接点击）

**评分系统**：
- 信源权重：OpenAI、Anthropic、DeepMind 等权威来源 +10分
- 关键词权重：GPT、Claude、breakthrough 等 +5分
- 标签权重：LLM、AI Research 等 +3分

**技术实现**：
- API：`/api/daily-summary`
- 数据范围：过去48小时
- 刷新频率：1小时
- 算法：简单评分系统（可升级为AI生成）

**优化建议**：
- 接入 GPT-4 API 生成更智能的总结
- 添加用户反馈机制，优化推荐算法
- 支持自定义关注领域
- 邮件/通知推送每日总结

---

## 🔧 配置说明

### 环境变量（可选）

创建 `.env.local` 文件：

```bash
# 翻译API（可选，使用自己的翻译服务）
TRANSLATION_API_KEY=your_key_here

# 基础URL（部署后自动配置）
NEXT_PUBLIC_BASE_URL=https://ai-feed-ten.vercel.app

# YouTube Data API（可选，提升抓取能力）
YOUTUBE_API_KEY=your_youtube_key

# Twitter API（可选，替代Nitter）
TWITTER_API_KEY=your_twitter_key
TWITTER_API_SECRET=your_twitter_secret
```

### 自定义信源

编辑配置文件添加更多数据源：

**RSS源**：`lib/sources.ts`
**YouTube**：`lib/social-sources.ts` - youtubeChannels
**Twitter**：`lib/social-sources.ts` - twitterAccounts

---

## 📈 性能优化建议

### 1. 缓存策略
```typescript
// 在 fetch 中添加 Next.js 缓存
fetch(url, {
  next: { revalidate: 300 } // 5分钟缓存
})
```

### 2. 数据库存储
- 使用 Redis/Vercel KV 缓存翻译结果
- 存储每日总结，避免重复计算
- 缓存YouTube字幕文稿

### 3. 后台定时任务
- 使用 Vercel Cron Jobs 定时抓取
- 提前生成每日总结
- 预加载翻译

### 4. API限流
```typescript
// 实现 Rate Limiting
import { Ratelimit } from "@upstash/ratelimit";
```

---

## 🐛 已知问题和解决方案

### YouTube 字幕获取失败
**原因**：部分视频没有字幕或字幕不可用  
**解决**：已做容错处理，不影响主流程

### Twitter/Nitter 不稳定
**原因**：Nitter 实例可能被限流或下线  
**解决**：配置了3个备用实例自动切换  
**建议**：使用 Twitter 官方 API

### 翻译API频率限制
**原因**：免费API有调用限制  
**解决**：实现缓存机制，按需翻译  
**建议**：升级到付费翻译服务

---

## 🚀 后续开发计划

### 短期（1-2周）
- [ ] 添加更多YouTube频道和Twitter账号
- [ ] 优化翻译质量（接入 GPT-4）
- [ ] 实现数据持久化（数据库）
- [ ] 添加用户收藏功能

### 中期（1个月）
- [ ] 支持Podcast音频内容
- [ ] 添加AI生成的深度总结
- [ ] 实现邮件订阅功能
- [ ] 多语言支持（不仅中英文）

### 长期（3个月+）
- [ ] 用户个性化推荐
- [ ] AI对话式信息检索
- [ ] 移动App开发
- [ ] 社区分享和讨论功能

---

## 📞 技术支持

遇到问题？

- 🐛 提交Issue：https://github.com/caicai688/ai-feed/issues
- 📖 查看文档：`README.md`
- 💬 讨论交流：GitHub Discussions

---

**最后更新**：2026-03-04  
**版本**：v2.0.0
