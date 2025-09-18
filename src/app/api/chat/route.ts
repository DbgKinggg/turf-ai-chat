import { streamText, convertToModelMessages, experimental_createMCPClient } from 'ai'
import { model, CRYPTO_SYSTEM_PROMPT } from '@/lib/ai'

export const maxDuration = 30


interface MCPClient {
  tools: () => Promise<Record<string, unknown>>
  close: () => Promise<void>
}

export async function POST(req: Request) {
  // let coinGeckoClient: MCPClient | null = null
  let heuristClient: MCPClient | null = null

  try {
    const { messages } = await req.json()

    // Initialize MCP clients for real-time crypto data access

    // CoinGecko MCP Client (for market data) - Temporarily disabled to reduce token usage
    // try {
    //   coinGeckoClient = await experimental_createMCPClient({
    //     transport: {
    //       type: 'sse',
    //       url: 'https://mcp.api.coingecko.com/sse'
    //     }
    //   })
    // } catch (error) {
    //   // Silent fail for CoinGecko
    // }

    // Heurist Mesh MCP Client (for advanced crypto intelligence)
    try {
      heuristClient = await experimental_createMCPClient({
        transport: {
          type: 'sse',
          url: 'https://sequencer-v2.heurist.xyz/mcp/sse',
          headers: process.env.HEURIST_API_KEY ? {
            'Authorization': `Bearer ${process.env.HEURIST_API_KEY}`
          } : undefined
        }
      })
    } catch (error) {
      // Silent fail for Heurist
    }

    // Collect tools from both MCP servers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allTools: Record<string, any> = {}

    // if (coinGeckoClient) {
    //   try {
    //     const coinGeckoTools = await coinGeckoClient.tools()
    //     Object.assign(allTools, coinGeckoTools)
    //   } catch (error) {
    //     // Silent fail
    //   }
    // }

    if (heuristClient) {
      try {
        const heuristTools = await heuristClient.tools()

        // Enable more tools including web search capabilities
        const limitedTools: Record<string, any> = {}
        const allowedTools = [
          'coingeckotokeninfoagent_get_token_price_multi',
          'coingeckotokeninfoagent_get_token_info',
          'coingeckotokeninfoagent_get_trending_coins',
          'exasearchagent_exa_web_search',
          'exasearchagent_exa_answer_question',
          'twitterinfoagent_get_general_search'
        ]

        for (const [name, tool] of Object.entries(heuristTools)) {
          if (allowedTools.includes(name)) {
            limitedTools[name] = tool
          }
        }

        Object.assign(allTools, limitedTools)
      } catch {
        // Silent fail
      }
    }


    // Generate response with access to all crypto intelligence tools
    const result = streamText({
      model,
      messages: convertToModelMessages(messages),
      system: CRYPTO_SYSTEM_PROMPT,
      temperature: 0.7,
      tools: Object.keys(allTools).length > 0 ? allTools : undefined,
      onFinish: async () => {
        // Clean up MCP clients
        // if (coinGeckoClient) {
        //   try {
        //     await coinGeckoClient.close()
        //   } catch (error) {
        //     // Silent fail
        //   }
        // }

        if (heuristClient) {
          try {
            await heuristClient.close()
          } catch {
            // Silent fail
          }
        }
      }
    })

    return result.toUIMessageStreamResponse()
  } catch {
    // Clean up clients on error
    // if (coinGeckoClient) {
    //   try {
    //     await coinGeckoClient.close()
    //   } catch {
    //     // Silent fail
    //   }
    // }

    if (heuristClient) {
      try {
        await heuristClient.close()
      } catch {
        // Silent fail
      }
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}