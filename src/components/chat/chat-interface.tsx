'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

export function ChatInterface() {
  const [input, setInput] = useState('')
  const { messages, sendMessage } = useChat()

  console.log('Messages:', messages)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage({ text: input })
      setInput('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const isLoading = false // We'll update this later based on message status

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Turf AI</h1>
              <p className="text-sm text-muted-foreground">Crypto Research Assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to Turf AI</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Ask me anything about cryptocurrency markets, projects, or trends. I can help you research and analyze the crypto space.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">📊 Market Analysis</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get insights on current market trends and price movements
                  </p>
                </Card>
                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">🔍 Project Research</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Deep dive into crypto projects and their fundamentals
                  </p>
                </Card>
                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">📈 Technical Analysis</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chart patterns, indicators, and technical insights
                  </p>
                </Card>
                <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">⚡ Real-time Data</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current prices, volume, and market data analysis
                  </p>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-4">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="text-sm font-medium">
                      {message.role === 'user' ? 'You' : 'Turf AI'}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">
                        {message.parts?.map((part, index) => {
                          if (part.type === 'text') {
                            return <div key={`${message.id}-${index}`}>{part.text}</div>
                          }
                          return null
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-2">Turf AI</div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about crypto markets, projects, or trends..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}