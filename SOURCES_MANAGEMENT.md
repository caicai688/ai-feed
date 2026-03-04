# 信源管理功能说明

本项目支持在前端页面动态添加、编辑和删除 YouTube 频道和 Twitter 账号，无需修改代码。

## 功能概述

- ✅ 在线管理 YouTube 频道
- ✅ 在线管理 Twitter/X 账号
- ✅ 实时生效，无需重启
- ✅ 浏览器本地存储配置
- ✅ 支持恢复默认配置
- ✅ 批量操作：添加、编辑、删除

## 使用方法

### 访问管理页面

1. 在首页点击右上角的 **⚙️ 管理信源** 按钮
2. 或直接访问 `/manage` 页面

### 管理 YouTube 频道

#### 添加新频道

1. 切换到 **YouTube 频道** 标签页
2. 点击 **+ 添加YouTube频道** 按钮
3. 填写以下信息：
   - **频道名称** *（必填）：显示在卡片上的名称，如 "OpenAI"
   - **频道 ID** *（必填）：YouTube 频道的唯一标识符
   - **标签**（可选）：用逗号分隔，如 "AI, OpenAI, Demo"
4. 点击 **添加** 按钮

#### 如何获取 YouTube 频道 ID

**方法 1：从频道 URL 获取**
```
https://www.youtube.com/channel/UCXZCJLdBC09xxGZ6gcdrc6A
                                └── 这就是频道ID
```

**方法 2：通过频道页面**
1. 访问 YouTube 频道主页
2. 点击 **关于** 标签
3. 点击 **分享频道**
4. 选择 **复制频道 ID**

**方法 3：从自定义 URL 转换**
如果频道使用自定义 URL（如 `youtube.com/@openai`），需要：
1. 访问该频道页面
2. 右键查看网页源代码
3. 搜索 `channelId` 或 `externalId`

#### 编辑频道

1. 在频道列表中找到要编辑的频道
2. 点击右侧的 **编辑** 按钮
3. 修改信息后点击 **更新**

#### 删除频道

1. 在频道列表中找到要删除的频道
2. 点击右侧的 **删除** 按钮
3. 确认删除操作

### 管理 Twitter 账号

#### 添加新账号

1. 切换到 **Twitter 账号** 标签页
2. 点击 **+ 添加Twitter账号** 按钮
3. 填写以下信息：
   - **账号名称** *（必填）：显示名称，如 "Sam Altman"
   - **用户名** *（必填）：Twitter 用户名，**不含 @**，如 "sama"
   - **标签**（可选）：用逗号分隔，如 "OpenAI, CEO, Industry"
4. 点击 **添加** 按钮

#### 如何获取 Twitter 用户名

Twitter 用户名就是个人资料页面 URL 中的部分：
```
https://twitter.com/sama
                   └── 这就是用户名（不含@）
```

或从 Twitter 个人资料中的 @用户名 获取。

#### 编辑账号

1. 在账号列表中找到要编辑的账号
2. 点击右侧的 **编辑** 按钮
3. 修改信息后点击 **更新**

#### 删除账号

1. 在账号列表中找到要删除的账号
2. 点击右侧的 **删除** 按钮
3. 确认删除操作

## 数据存储

### 本地存储机制

配置数据保存在浏览器的 **localStorage** 中：
- `customYoutubeChannels`: 自定义 YouTube 频道列表
- `customTwitterAccounts`: 自定义 Twitter 账号列表

### 特点

- ✅ **持久化**：配置在同一浏览器中永久保存
- ✅ **实时生效**：修改后刷新首页即可看到新数据
- ❌ **不跨设备**：不同设备/浏览器需要分别配置
- ❌ **无云同步**：清除浏览器数据会丢失配置

### 恢复默认配置

如果想要重置为初始配置：
1. 在管理页面点击右上角的 **恢复默认** 按钮
2. 确认操作
3. 配置将恢复为预设的 5 个 YouTube 频道和 8 个 Twitter 账号

## 技术实现

### API 端点

1. **GET /api/social-sources**
   - 返回默认的 YouTube 频道和 Twitter 账号配置

2. **POST /api/youtube**
   - 接收自定义频道列表，返回对应数据
   - Body: `{ "channels": [YouTubeChannel[]] }`

3. **POST /api/twitter**
   - 接收自定义账号列表，返回对应数据
   - Body: `{ "accounts": [TwitterAccount[]] }`

### 工作流程

```
用户添加信源
    ↓
保存到 localStorage
    ↓
刷新首页
    ↓
读取 localStorage 配置
    ↓
调用 API（传递自定义配置）
    ↓
显示自定义信源的最新内容
```

## 推荐信源

### YouTube 频道推荐

| 频道名 | 频道ID | 说明 |
|--------|--------|------|
| OpenAI | UCXZCJLdBC09xxGZ6gcdrc6A | GPT、DALL-E 官方演示 |
| Anthropic | UC3FGAtGzL_vTkXIcLNkpVtA | Claude AI 官方频道 |
| Google DeepMind | UCP7jMXSY2xbc3KCAE0MHQ-A | DeepMind 研究成果 |
| Lex Fridman | UCSHZKyawb77ixDdsGog4iWA | AI 领域深度访谈 |
| Two Minute Papers | UCbfYPyITQ-7l4upoX8nvctg | AI 论文可视化解读 |
| Yannic Kilcher | UCZHmQk67mSJgfCCTn7xBfew | AI 论文详解 |
| AI Explained | UC7p_I0qxYZP94vhesuLAWNA | AI 新闻和解读 |

### Twitter 账号推荐

| 姓名 | 用户名 | 说明 |
|------|--------|------|
| Sam Altman | sama | OpenAI CEO |
| Dario Amodei | DarioAmodei | Anthropic CEO |
| Yann LeCun | ylecun | Meta AI 首席科学家 |
| Andrew Ng | AndrewYNg | AI 教育领袖 |
| Andrej Karpathy | karpathy | AI 研究者 |
| Jim Fan | drjimfan | 英伟达高级研究科学家 |
| François Chollet | fchollet | Keras 创始人 |
| Emad Mostaque | EMostaque | Stability AI CEO |

## 常见问题

### Q: 添加的信源何时生效？
A: 保存后立即生效。刷新首页（点击"刷新"按钮）即可看到新信源的内容。

### Q: 可以添加多少个信源？
A: 理论上无限制，但建议：
- YouTube 频道：5-15 个（太多会影响加载速度）
- Twitter 账号：10-30 个

### Q: 为什么有些 Twitter 账号抓取失败？
A: 项目使用 Nitter（Twitter 的开源前端）抓取数据，可能因为：
- Nitter 实例不稳定
- 该账号推文频率过低
- 账号设置了隐私保护

### Q: 如何在多设备间同步配置？
A: 目前不支持云同步。未来可能的方案：
- 导出/导入 JSON 配置文件
- 连接到云存储服务
- 使用账号系统同步

### Q: 配置会影响性能吗？
A: 
- ✅ 前端：无影响（配置存储在浏览器本地）
- ⚠️ 后端：信源越多，API 响应时间越长
- 💡 建议：只添加真正关注的信源

### Q: 可以导出配置吗？
A: 目前还不支持。可以手动从浏览器开发者工具中复制 localStorage 数据：
```javascript
// 在浏览器控制台执行
console.log(localStorage.getItem('customYoutubeChannels'));
console.log(localStorage.getItem('customTwitterAccounts'));
```

## 未来计划

- [ ] 导出/导入配置功能
- [ ] RSS 源的前端管理
- [ ] 信源分组功能
- [ ] 云端配置同步
- [ ] 批量导入信源
- [ ] 信源质量评分
- [ ] 推荐信源列表

## 反馈与建议

如有问题或建议，欢迎：
- 提交 [GitHub Issue](https://github.com/caicai688/ai-feed/issues)
- 发起 [Pull Request](https://github.com/caicai688/ai-feed/pulls)
