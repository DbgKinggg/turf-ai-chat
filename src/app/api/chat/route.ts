import { streamText, convertToModelMessages, experimental_createMCPClient, stepCountIs } from 'ai'
import { model, CRYPTO_SYSTEM_PROMPT } from '@/lib/ai'

export const maxDuration = 45

interface MCPClient {
  tools: () => Promise<Record<string, unknown>>
  close: () => Promise<void>
}

// Estimate token count (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Truncate tool responses to prevent rate limit issues
function truncateToolResponse(response: any, maxTokens: number = 8000): any {
  if (typeof response !== 'object' || response === null) {
    return response
  }

  const responseStr = JSON.stringify(response)
  const estimatedTokens = estimateTokens(responseStr)

  if (estimatedTokens <= maxTokens) {
    return response
  }

  console.warn(`🔥 Tool response too large (${estimatedTokens} tokens), truncating to ${maxTokens}`)

  // For search results, keep first few and truncate text
  if (response.data?.search_results?.length > 0) {
    const results = response.data.search_results.slice(0, 5) // Keep first 5 results

    return {
      ...response,
      data: {
        ...response.data,
        search_results: results.map((result: any) => ({
          ...result,
          text: result.text ? result.text.substring(0, 1000) + '...[truncated]' : result.text
        })),
        _truncated: true,
        _originalCount: response.data.search_results.length
      }
    }
  }

  // For other responses, truncate the string representation
  const truncatedStr = responseStr.substring(0, maxTokens * 4) + '...[truncated]'
  try {
    return JSON.parse(truncatedStr)
  } catch {
    return { _truncated: true, _content: truncatedStr }
  }
}

// Cache MCP client and tools to avoid recreating on every request
let cachedHeuristClient: MCPClient | null = null
let cachedTools: Record<string, any> = {}
let lastToolsUpdate = 0
const TOOLS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Wrap tools to apply response filtering
function wrapToolsWithFiltering(tools: Record<string, any>): Record<string, any> {
  const wrappedTools: Record<string, any> = {}

  for (const [name, tool] of Object.entries(tools)) {
    wrappedTools[name] = {
      ...tool,
      execute: async (...args: any[]) => {
        try {
          console.log(`🔧 Executing tool: ${name}`)
          const result = await tool.execute(...args)
          const filtered = truncateToolResponse(result)
          const originalSize = JSON.stringify(result).length
          const filteredSize = JSON.stringify(filtered).length

          if (originalSize !== filteredSize) {
            console.log(`🔥 Filtered ${name}: ${originalSize} → ${filteredSize} chars`)
          }

          return filtered
        } catch (error) {
          console.error(`Tool ${name} error:`, error)
          throw error
        }
      }
    }
  }

  return wrappedTools
}

async function getOrCreateMCPClient() {
  const now = Date.now()

  // Use cached tools if they're fresh
  if (cachedHeuristClient && cachedTools && Object.keys(cachedTools).length > 0 && (now - lastToolsUpdate) < TOOLS_CACHE_TTL) {
    return { client: cachedHeuristClient, tools: wrapToolsWithFiltering(cachedTools) }
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
    return { client: cachedHeuristClient, tools: wrapToolsWithFiltering(cachedTools) }
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
      stopWhen: stepCountIs(10),
      temperature: 0.7,
      maxOutputTokens: 4000,
      onFinish: ({ text, toolCalls, toolResults, usage, steps, finishReason }) => {
        console.log('🏁 Stream finished:', {
          textLength: text?.length,
          toolCallsCount: toolCalls?.length,
          toolResultsCount: toolResults?.length,
          stepsCount: steps?.length,
          finishReason,
          usage
        })

        if (finishReason === 'length') {
          console.warn('⚠️ Response truncated due to token limit')
        }
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Check for rate limit errors
    const isRateLimitError = errorMessage.includes('rate limit') ||
                            errorMessage.includes('429') ||
                            (error as any)?.status === 429

    // Check if error is related to context length
    const isContextError = errorMessage.toLowerCase().includes('context') ||
                          errorMessage.toLowerCase().includes('token') ||
                          errorMessage.toLowerCase().includes('length')

    if (isRateLimitError) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          details: 'Too many requests. The search returned very large results. Please wait a moment and try a more specific question.',
          retryAfter: 60 // seconds
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          },
        }
      )
    }

    return new Response(
      JSON.stringify({
        error: isContextError ? 'Response too long, please try a more specific question' : 'Internal server error',
        details: isContextError ? 'The response exceeded the maximum length. Try asking for a smaller subset of information.' : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}