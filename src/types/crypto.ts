export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  volume_24h: number
  last_updated: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  cryptoData?: CryptoPrice[]
}

export interface ResearchMode {
  type: 'ask' | 'research'
  description: string
}

export interface AppState {
  messages: Message[]
  isLoading: boolean
  currentMode: ResearchMode
  watchlist: string[]
  currentPrices: Record<string, CryptoPrice>
  theme: 'dark' | 'light'
  sidebarOpen: boolean
}