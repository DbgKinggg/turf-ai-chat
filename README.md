# Turf AI - A Web3 AI Chat

[English](README.md) | [中文](README-zh.md)

A [Surf](https://asksurf.ai/chat) clone built for educational purposes to help developers learn how to build similar AI-powered cryptocurrency research applications.

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ⚠️ Educational Purpose Only

This project is a clone of Surf AI created solely for educational purposes. It's designed to help developers understand how to build AI-powered financial research tools. **This is not affiliated with the original Surf AI and should not be used for actual financial advice or trading decisions.**


## 🚀 Features

- **Real-time Crypto Data** - Live prices, market caps, and trading volumes via CoinGecko
- **Web Search Integration** - Current crypto news and developments via Exa Search
- **Social Sentiment Analysis** - Twitter trends and community discussions
- **Modern UI** - Clean, responsive interface built with Next.js and Tailwind CSS
- **Markdown Support** - Rich text rendering with table formatting for data
- **Streaming Responses** - Real-time AI responses with proper loading states

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.3, React, TypeScript, Tailwind CSS
- **AI**: Claude 3.5 Sonnet via Anthropic AI SDK
- **Data Sources**: Heurist Mesh MCP (CoinGecko, Exa Search, Twitter)
- **UI Components**: shadcn/ui, Lucide React icons
- **Markdown**: Streamdown for rich text rendering

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Anthropic API key

## 🔧 Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd surf-clone
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API key:

   ```env
   # Required - Get from https://console.anthropic.com/
   ANTHROPIC_API_KEY="your_anthropic_api_key_here"
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser** Navigate to <http://localhost:3000> to see the application.

## 🔑 Getting API Keys

### Anthropic API Key (Required)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into your `.env.local` file

*Note: The app connects to Heurist's public MCP server automatically for real-time crypto data and web search capabilities.*

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/chat/          # Chat API endpoint
│   ├── globals.css        # Global styles
│   └── page.tsx           # Main page
├── components/
│   ├── chat/              # Chat interface components
│   ├── ui/                # Reusable UI components
│   └── ai-elements/       # AI-specific components
└── lib/
    ├── ai.ts              # AI model configuration
    └── utils.ts           # Utility functions
```

## 🎯 Key Features Explained

### Model Context Protocol (MCP)

This app uses Heurist's MCP integration to access:

- **CoinGecko**: Live cryptocurrency prices and market data
- **Exa Search**: Web search for current crypto news
- **Twitter**: Social sentiment analysis

### Performance Optimizations

- **Client Caching**: MCP clients are cached to reduce initialization time
- **Fast Model**: Uses Claude 3.5 Sonnet for optimal speed/quality balance
- **Compressed Prompts**: Minimized system prompts to reduce token usage

### UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Proper indicators during AI processing
- **Error Handling**: Graceful fallbacks when services are unavailable
- **Markdown Rendering**: Tables and rich text formatting

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

This Next.js app can be deployed on any platform that supports Node.js:

- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🤝 Contributing

This is an educational project! Feel free to:

- Fork the repository
- Create feature branches
- Submit pull requests
- Open issues for bugs or improvements

## 📞 Contact

For any questions or suggestions, feel free to reach out:

- **X/Twitter**: [@DbgKinggg](https://x.com/DbgKinggg)
- **Issues**: Open an issue on this repository

## 📝 Learning Resources

If you're building a similar app, check out:

- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic AI SDK](https://sdk.vercel.ai/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Heurist MCP Documentation](https://docs.heurist.ai/)

## ⚖️ License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Surf AI](https://surf.ai) - Original inspiration
- [Anthropic](https://anthropic.com) - Claude AI model
- [Heurist](https://heurist.ai) - MCP data integration
- [Vercel](https://vercel.com) - AI SDK and deployment platform

---

**Disclaimer**: This is an educational clone created for learning purposes. It is not affiliated with Surf AI. Always do your own research before making any financial decisions.