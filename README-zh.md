# Turf AI - Web3 AI智能助手

[English](README.md) | [中文](README-zh.md)

这是一个基于 [Surf](https://asksurf.ai/chat) 的克隆项目，专为教育目的而构建，帮助开发者学习如何构建类似的AI驱动加密货币研究应用程序。

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ⚠️ 仅供教育用途

该项目是Surf AI的克隆版本，纯粹为教育目的而创建。它旨在帮助开发者理解如何构建AI驱动的金融研究工具。**本项目与原版Surf AI无关，不应用于实际的金融建议或交易决策。**

## 🚀 功能特性

- **实时加密数据** - 通过CoinGecko获取实时价格、市值和交易量
- **网络搜索集成** - 通过Exa Search获取当前加密新闻和发展动态
- **社交情绪分析** - Twitter趋势和社区讨论
- **现代化UI** - 使用Next.js和Tailwind CSS构建的简洁响应式界面
- **Markdown支持** - 支持富文本渲染和表格格式化数据展示
- **流式响应** - 实时AI响应，配备适当的加载状态

## 🎥 演示

观看Turf AI实际运行：

https://github.com/user-attachments/assets/demo.mov

*快速演示AI助手如何通过实时数据集成研究加密货币项目。*

## 🛠️ 技术栈

- **前端**: Next.js 15.5.3, React, TypeScript, Tailwind CSS
- **AI**: 通过Anthropic AI SDK使用Claude 3.5 Sonnet
- **数据源**: Heurist Mesh MCP (CoinGecko, Exa Search, Twitter)
- **UI组件**: shadcn/ui, Lucide React图标
- **Markdown**: Streamdown用于富文本渲染

## 📋 前置要求

- Node.js 18+
- npm、yarn或pnpm
- Anthropic API密钥

## 🔧 安装步骤

1. **克隆仓库**

   ```bash
   git clone <repository-url>
   cd surf-clone
   ```

2. **安装依赖**

   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. **设置环境变量**

   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local` 并添加你的API密钥：

   ```env
   # 必需 - 从 https://console.anthropic.com/ 获取
   ANTHROPIC_API_KEY="your_anthropic_api_key_here"
   ```

4. **运行开发服务器**

   ```bash
   npm run dev
   # 或
   yarn dev
   # 或
   pnpm dev
   ```

5. **打开浏览器** 访问 <http://localhost:3000> 查看应用程序。

## 🔑 获取API密钥

### Anthropic API密钥（必需）

1. 访问 [Anthropic控制台](https://console.anthropic.com/)
2. 注册或登录
3. 导航到API密钥页面
4. 创建新的API密钥
5. 复制粘贴到你的 `.env.local` 文件中

*注意：应用程序会自动连接到Heurist的公共MCP服务器，用于实时加密数据和网络搜索功能。*

## 🏗️ 项目结构

```
src/
├── app/
│   ├── api/chat/          # 聊天API端点
│   ├── globals.css        # 全局样式
│   └── page.tsx           # 主页面
├── components/
│   ├── chat/              # 聊天界面组件
│   ├── ui/                # 可重用UI组件
│   └── ai-elements/       # AI特定组件
└── lib/
    ├── ai.ts              # AI模型配置
    └── utils.ts           # 工具函数
```

## 🎯 核心功能说明

### 模型上下文协议（MCP）

该应用使用Heurist的MCP集成来访问：

- **CoinGecko**: 实时加密货币价格和市场数据
- **Exa Search**: 当前加密新闻的网络搜索
- **Twitter**: 社交情绪分析

### 性能优化

- **客户端缓存**: MCP客户端被缓存以减少初始化时间
- **快速模型**: 使用Claude 3.5 Sonnet获得最佳速度/质量平衡
- **压缩提示**: 最小化系统提示以减少令牌使用

### UI/UX功能

- **响应式设计**: 支持桌面和移动设备
- **加载状态**: AI处理期间的适当指示器
- **错误处理**: 服务不可用时的优雅降级
- **Markdown渲染**: 表格和富文本格式化

## 🚀 部署

### Vercel（推荐）

1. 将代码推送到GitHub
2. 将仓库连接到 [Vercel](https://vercel.com)
3. 在Vercel仪表板中添加环境变量
4. 部署

### 其他平台

这个Next.js应用可以部署在任何支持Node.js的平台上：

- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🤝 贡献

这是一个教育项目！欢迎：

- Fork仓库
- 创建功能分支
- 提交拉取请求
- 为错误或改进开启issue

## 📞 联系方式

如有任何问题或建议，请随时联系：

- **X/Twitter**: [@DbgKinggg](https://x.com/DbgKinggg)
- **Issues**: 在此仓库中开启issue

## 📝 学习资源

如果你正在构建类似应用，请查看：

- [Next.js文档](https://nextjs.org/docs)
- [Anthropic AI SDK](https://sdk.vercel.ai/docs)
- [模型上下文协议](https://modelcontextprotocol.io/)
- [Heurist MCP文档](https://docs.heurist.ai/)

## ⚖️ 许可证

该项目是开源的，使用 [MIT许可证](LICENSE)。

## 🙏 致谢

- [Surf AI](https://surf.ai) - 原始灵感来源
- [Anthropic](https://anthropic.com) - Claude AI模型
- [Heurist](https://heurist.ai) - MCP数据集成
- [Vercel](https://vercel.com) - AI SDK和部署平台

---

**免责声明**: 这是为学习目的创建的教育克隆版本。它与Surf AI无关。在做出任何金融决策之前，请务必进行自己的研究。