# Surf AI - Dual MCP Integration Plan

## Overview
Enhance Surf AI crypto research assistant with real-time data access through two powerful MCP (Model Context Protocol) servers:
- **CoinGecko MCP**: Reliable market data for 15,000+ cryptocurrencies
- **Heurist Mesh MCP**: Advanced AI-powered crypto intelligence and social analysis

## Implementation Phases

### Phase 1: Dependencies & Environment Setup ✅

#### 1.1 Install MCP SDK Dependencies
```bash
npm install @modelcontextprotocol/sdk
```

#### 1.2 Environment Configuration (.env.local)
```env
# Existing
ANTHROPIC_API_KEY=sk-ant-api03-...

# New MCP Server Keys
COINGECKO_API_KEY=your_coingecko_api_key_here  # Optional but recommended
HEURIST_API_KEY=your_heurist_api_key_here      # Required for Heurist
```

### Phase 2: Dual MCP Client Implementation

#### 2.1 Update Chat API Route (`src/app/api/chat/route.ts`)
- Import MCP client utilities
- Initialize both CoinGecko and Heurist MCP clients
- Merge tools from both servers
- Implement error handling and client cleanup

#### 2.2 Expected Code Structure
```typescript
import { experimental_createMCPClient, streamText } from 'ai'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse'

// Initialize both MCP clients
const coinGeckoClient = await experimental_createMCPClient({
  transport: new SSEClientTransport({ url: 'https://mcp.api.coingecko.com/mcp' })
})

const heuristClient = await experimental_createMCPClient({
  transport: new SSEClientTransport({ url: 'https://sequencer-v2.heurist.xyz/mcp/sse' })
})

// Combine tools from both servers
const coinGeckoTools = await coinGeckoClient.tools()
const heuristTools = await heuristClient.tools()
const allTools = { ...coinGeckoTools, ...heuristTools }
```

### Phase 3: Enhanced Crypto Intelligence Capabilities

#### 3.1 CoinGecko MCP Tools
- ✅ Live cryptocurrency prices
- ✅ Market capitalizations and rankings
- ✅ Trading volumes and 24h changes
- ✅ Trending coins discovery
- ✅ Historical price data
- ✅ Cryptocurrency categories and metadata

#### 3.2 Heurist Mesh MCP Tools
- ✅ Token security analysis (GoPlus integration)
- ✅ Twitter sentiment and trending analysis
- ✅ DexScreener trading pair analysis
- ✅ Web research capabilities
- ✅ Account and mention searches
- ✅ Query generation and web page analysis

### Phase 4: System Prompt Enhancement

#### 4.1 Update Claude Instructions (`src/lib/ai.ts`)
- Document available tool categories
- Provide guidance on data source selection
- Add source attribution requirements
- Include error handling instructions

#### 4.2 Enhanced Capabilities Description
```
You now have access to comprehensive crypto intelligence through:

1. **Market Data (CoinGecko)**: Real-time prices, market caps, volumes for 15,000+ cryptocurrencies
2. **Security Analysis (Heurist)**: Token safety checks, smart contract audits
3. **Social Intelligence (Heurist)**: Twitter trends, sentiment analysis, community discussions
4. **Trading Analysis (Heurist)**: DEX data, trading pairs, liquidity information
5. **Web Research (Heurist)**: General crypto research and news analysis

Always cite your data sources and mention when information might be time-sensitive.
```

### Phase 5: Implementation Progress Tracking

#### 5.1 Current Status ✅ COMPLETED
- [x] Phase 1: Dependencies & Environment Setup
  - [x] Install MCP SDK (`@modelcontextprotocol/sdk`)
  - [x] Configure API keys (CoinGecko & Heurist placeholders in .env.local)
- [x] Phase 2: Dual MCP Implementation
  - [x] Update API route with dual MCP client initialization
  - [x] Implement SSE transport for both CoinGecko and Heurist
  - [x] Add comprehensive error handling and client cleanup
- [x] Phase 3: Tool Integration
  - [x] Merge tools from both MCP servers
  - [x] Implement fallback behavior when tools unavailable
  - [x] Add detailed logging for debugging
- [x] Phase 4: System Prompt Update
  - [x] Enhanced capabilities description with tool categories
  - [x] Source attribution guidelines
  - [x] Usage instructions for different query types
- [x] Phase 5: Testing & Validation
  - [x] No TypeScript errors detected
  - [x] Server running successfully on localhost:3001
  - [x] Error handling validation implemented

## Technical Implementation Notes

### MCP Client Management
- Both clients use SSE (Server-Sent Events) transport for real-time data
- Clients must be properly closed after use to prevent resource leaks
- Error handling for network failures and API rate limits

### Tool Merging Strategy
- Combine tools from both servers into single toolset
- Handle potential naming conflicts between similar tools
- Maintain source attribution for each tool response

### Performance Considerations
- Initialize MCP clients efficiently
- Implement proper timeout handling
- Consider caching strategies for frequently requested data

## Benefits of Dual Integration

### 1. Comprehensive Coverage
- **Market Data**: Reliable price and volume information
- **Intelligence**: Advanced analysis and social insights
- **Security**: Token safety and smart contract analysis

### 2. Redundancy & Reliability
- Service failover capabilities
- Cross-validation of data sources
- Reduced single points of failure

### 3. Enhanced User Experience
- Answer both simple ("What's Bitcoin's price?") and complex ("Is this token safe?") queries
- Provide comprehensive crypto research capabilities
- Real-time data with intelligent analysis

### 4. Future-Proof Architecture
- Automatic access to new Heurist AI agents
- Scalable to additional MCP servers
- Standards-based integration approach

## Next Steps
1. Complete Phase 1 setup
2. Implement dual MCP client
3. Test integration thoroughly
4. Enhance system prompt
5. Validate end-to-end functionality

---
*Last Updated: [Current Date]*
*Implementation Status: In Progress*