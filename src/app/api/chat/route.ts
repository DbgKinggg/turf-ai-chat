import { streamText, convertToModelMessages, experimental_createMCPClient, stepCountIs } from 'ai'
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

    // Get cached or create new MCP client
    const { tools: allTools } = await getOrCreateMCPClient()

    console.log('Available tools:', Object.keys(allTools))

    const result = streamText({
      model,
      messages: convertToModelMessages(messages),
      system: CRYPTO_SYSTEM_PROMPT,
      tools: allTools,
      stopWhen: stepCountIs(3),
      temperature: 0.7,
      onFinish: ({ text, toolCalls, toolResults, usage, steps }) => {
        console.log('🏁 Stream finished:', {
          textLength: text?.length,
          toolCallsCount: toolCalls?.length,
          toolResultsCount: toolResults?.length,
          stepsCount: steps?.length,
          usage
        })
      },
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