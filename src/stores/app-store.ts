import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, Message, ResearchMode, CryptoPrice } from '@/types/crypto'

interface AppStore extends AppState {
  // Message actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void

  // Research mode actions
  setCurrentMode: (mode: ResearchMode) => void

  // Watchlist actions
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void

  // Price actions
  updatePrices: (prices: Record<string, CryptoPrice>) => void

  // UI actions
  toggleTheme: () => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      isLoading: false,
      currentMode: { type: 'ask', description: 'Quick crypto queries' },
      watchlist: ['bitcoin', 'ethereum', 'solana'],
      currentPrices: {},
      theme: 'dark',
      sidebarOpen: false,

      // Message actions
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
        }
        set((state) => ({
          messages: [...state.messages, newMessage],
        }))
      },

      clearMessages: () => set({ messages: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Research mode actions
      setCurrentMode: (mode) => set({ currentMode: mode }),

      // Watchlist actions
      addToWatchlist: (symbol) => {
        const { watchlist } = get()
        if (!watchlist.includes(symbol)) {
          set({ watchlist: [...watchlist, symbol] })
        }
      },

      removeFromWatchlist: (symbol) => {
        set((state) => ({
          watchlist: state.watchlist.filter(s => s !== symbol)
        }))
      },

      // Price actions
      updatePrices: (prices) => set({ currentPrices: prices }),

      // UI actions
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),

      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),
    }),
    {
      name: 'surf-app-storage',
      partialize: (state) => ({
        watchlist: state.watchlist,
        theme: state.theme,
        messages: state.messages.slice(-50), // Keep only last 50 messages
      }),
    }
  )
)