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
    console.log('Initializing MCP clients...')

    // CoinGecko MCP Client (for market data) - Temporarily disabled to reduce token usage
    // try {
    //   coinGeckoClient = await experimental_createMCPClient({
    //     transport: {
    //       type: 'sse',
    //       url: 'https://mcp.api.coingecko.com/sse'
    //     }
    //   })
    //   console.log('CoinGecko MCP client initialized')
    // } catch (error) {
    //   console.warn('CoinGecko MCP client failed to initialize:', error)
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
      console.log('Heurist MCP client initialized')
    } catch (error) {
      console.warn('Heurist MCP client failed to initialize:', error)
    }

    // Collect tools from both MCP servers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allTools: Record<string, any> = {}

    // if (coinGeckoClient) {
    //   try {
    //     const coinGeckoTools = await coinGeckoClient.tools()
    //     Object.assign(allTools, coinGeckoTools)
    //     console.log(`Added ${Object.keys(coinGeckoTools).length} CoinGecko tools`)
    //   } catch (error) {
    //     console.warn('Failed to get CoinGecko tools:', error)
    //   }
    // }

    if (heuristClient) {
      try {
        const heuristTools = await heuristClient.tools()
        console.log('Heurist tools received:', JSON.stringify(Object.keys(heuristTools), null, 2))

        // Let's try just adding a subset of tools to see if that works
        const limitedTools: Record<string, any> = {}
        const allowedTools = ['coingeckotokeninfoagent_get_token_price_multi', 'coingeckotokeninfoagent_get_token_info']

        for (const [name, tool] of Object.entries(heuristTools)) {
          if (allowedTools.includes(name)) {
            limitedTools[name] = tool
          }
        }

        Object.assign(allTools, limitedTools)
        console.log(`Added ${Object.keys(limitedTools).length} limited Heurist tools:`, Object.keys(limitedTools))
      } catch (error) {
        console.warn('Failed to get Heurist tools:', error)
      }
    }

    console.log(`Total tools available: ${Object.keys(allTools).length}`)

    if (Object.keys(allTools).length > 0) {
      console.log('Available tool names:', Object.keys(allTools))
    }

    // Generate response with access to all crypto intelligence tools
    const result = streamText({
      model,
      messages: convertToModelMessages(messages),
      system: CRYPTO_SYSTEM_PROMPT,
      temperature: 0.7,
      tools: Object.keys(allTools).length > 0 ? allTools : undefined,
      onFinish: async () => {
        // // Clean up MCP clients
        // if (coinGeckoClient) {
        //   try {
        //     await coinGeckoClient.close()
        //     console.log('CoinGecko MCP client closed')
        //   } catch (error) {
        //     console.warn('Error closing CoinGecko client:', error)
        //   }
        // }

        if (heuristClient) {
          try {
            await heuristClient.close()
            console.log('Heurist MCP client closed')
          } catch (error) {
            console.warn('Error closing Heurist client:', error)
          }
        }
      }
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)

    // // Clean up clients on error
    // if (coinGeckoClient) {
    //   try {
    //     await coinGeckoClient.close()
    //   } catch (e) {
    //     console.warn('Error closing CoinGecko client on error:', e)
    //   }
    // }

    if (heuristClient) {
      try {
        await heuristClient.close()
      } catch (e) {
        console.warn('Error closing Heurist client on error:', e)
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