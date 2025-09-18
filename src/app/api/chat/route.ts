import { streamText, convertToModelMessages, experimental_createMCPClient } from 'ai'
import { model, CRYPTO_SYSTEM_PROMPT } from '@/lib/ai'

export const maxDuration = 45

interface MCPClient {
  tools: () => Promise<Record<string, unknown>>
  close: () => Promise<void>
}

// Cache MCP client and tools to avoid recreating on every request
let cachedHeuristClient: MCPClient | null = null
let cachedTools: Record<string, any> = {}
let lastToolsUpdate = 0
const TOOLS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getOrCreateMCPClient() {
  const now = Date.now()

  // Use cached tools if they're fresh
  if (cachedHeuristClient && cachedTools && Object.keys(cachedTools).length > 0 && (now - lastToolsUpdate) < TOOLS_CACHE_TTL) {
    return { client: cachedHeuristClient, tools: cachedTools }
  }

  try {
    // Close existing client if any
    if (cachedHeuristClient) {
      try {
        await cachedHeuristClient.close()
      } catch {
        // Silent fail
      }
    }

    cachedHeuristClient = await experimental_createMCPClient({
      transport: {
        type: 'sse',
        url: 'https://sequencer-v2.heurist.xyz/mcp/sse'
      }
    })

    const heuristTools = await cachedHeuristClient.tools()
    const allowedTools = [
      'coingeckotokeninfoagent_get_token_price_multi',
      'coingeckotokeninfoagent_get_token_info',
      'coingeckotokeninfoagent_get_trending_coins',
      'exasearchagent_exa_web_search',
      'exasearchagent_exa_answer_question',
      'twitterinfoagent_get_general_search'
    ]

    cachedTools = {}
    for (const [name, tool] of Object.entries(heuristTools)) {
      if (allowedTools.includes(name)) {
        cachedTools[name] = tool
      }
    }

    lastToolsUpdate = now
    return { client: cachedHeuristClient, tools: cachedTools }
  } catch (error) {
    console.error('Failed to initialize MCP client:', error)
    return { client: null, tools: {} }
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''

    // Get cached or create new MCP client
    const { client: heuristClient, tools: allTools } = await getOrCreateMCPClient()

    console.log('Available tools:', Object.keys(allTools))

    // Detect different types of crypto queries
    const queryPatterns = [
      {
        pattern: (msg: string) => msg.includes('trending') && (msg.includes('crypto') || msg.includes('coin')),
        tool: 'coingeckotokeninfoagent_get_trending_coins',
        args: {},
        context: 'trending cryptocurrency data',
        instructions: 'format this data into a nice markdown table with columns for Rank, Name, Symbol, Price, and Market Cap Rank'
      },
      {
        pattern: (msg: string) => (msg.includes('price') || msg.includes('cost')) && (msg.includes('bitcoin') || msg.includes('btc')),
        tool: 'coingeckotokeninfoagent_get_token_info',
        args: { coingecko_id: 'bitcoin' },
        context: 'Bitcoin price and market data',
        instructions: 'format this data showing current price, market cap, 24h change, and other key metrics in a clear format'
      },
      {
        pattern: (msg: string) => (msg.includes('price') || msg.includes('cost')) && (msg.includes('ethereum') || msg.includes('eth')),
        tool: 'coingeckotokeninfoagent_get_token_info',
        args: { coingecko_id: 'ethereum' },
        context: 'Ethereum price and market data',
        instructions: 'format this data showing current price, market cap, 24h change, and other key metrics in a clear format'
      },
      {
        pattern: (msg: string) => msg.includes('search') && (msg.includes('crypto') || msg.includes('news') || msg.includes('bitcoin') || msg.includes('ethereum')),
        tool: 'exasearchagent_exa_web_search',
        args: { query: lastMessage },
        context: 'crypto news and information',
        instructions: 'summarize the key findings and present them in a well-organized format'
      }
    ]

    let enhancedMessages = messages
    const detectedQuery = queryPatterns.find(q => q.pattern(lastMessage))

    if (detectedQuery && heuristClient && allTools[detectedQuery.tool]) {
      try {
        console.log(`📊 Fetching ${detectedQuery.context} manually...`)

        // Call the appropriate tool manually via the tools object
        const tool = allTools[detectedQuery.tool]
        const toolResult = await tool(detectedQuery.args)

        console.log('🎯 Tool result:', toolResult)

        if (toolResult) {
          // Add the tool result as context to the conversation
          enhancedMessages = [
            ...messages,
            {
              role: 'system',
              content: `Here is the current ${detectedQuery.context}: ${JSON.stringify(toolResult, null, 2)}.

              Please ${detectedQuery.instructions}. Include proper formatting and add relevant analysis.`
            }
          ]
        }
      } catch (error) {
        console.error(`❌ Error calling ${detectedQuery.tool}:`, error)
      }
    }

    const result = streamText({
      model,
      messages: convertToModelMessages(enhancedMessages),
      system: CRYPTO_SYSTEM_PROMPT,
      temperature: 0.7,
      onFinish: ({ text, toolCalls, toolResults, usage }) => {
        console.log('🏁 Stream finished:', {
          textLength: text?.length,
          toolCallsCount: toolCalls?.length,
          toolResultsCount: toolResults?.length,
          usage,
          wasEnhanced: enhancedMessages.length > messages.length
        })
      },
      // Don't close client on finish - keep it cached
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}