'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { ArrowUp, Bot, User, Menu, Plus, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Response } from '@/components/ai-elements/response'
import { cn } from '@/lib/utils'

interface Chat {
  id: string
  title: string
  lastMessage?: string
  timestamp: Date
}

export function ModernChatInterface() {
  const [input, setInput] = useState('')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Crypto Market Analysis',
      lastMessage: 'What\'s the current price of Bitcoin?',
      timestamp: new Date()
    },
    {
      id: '2',
      title: 'DeFi Research',
      lastMessage: 'Analyze the top DeFi protocols',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
  const [activeChat, setActiveChat] = useState('1')

  const { messages, sendMessage, status, error } = useChat()
  const isLoading = status === 'streaming'
  const hasError = !!error

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollElement = scrollAreaRef.current
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage({
        text: input
      })
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Sidebar - Always visible on desktop, toggles between collapsed/expanded */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-200 ease-in-out",
          "hidden md:block", // Always visible on desktop
          sidebarExpanded ? "w-80" : "w-16" // Toggle width
        )}
      >
        {/* Collapsed Sidebar Content */}
        {!sidebarExpanded ? (
          <div className="flex flex-col h-full items-center py-4">
            {/* Logo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarExpanded(true)}
              className="mb-4 w-10 h-10 p-0"
              title="Expand sidebar"
            >
              <Bot className="w-5 h-5 text-primary" />
            </Button>

            {/* Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarExpanded(true)}
              className="mb-4 w-10 h-10 p-0"
              title="Expand sidebar"
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* New Chat Button */}
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 w-10 h-10 p-0"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </Button>

            {/* User Avatar at bottom */}
            <div className="mt-auto">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        ) : (
          /* Expanded Sidebar Content */
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <span className="font-semibold">Turf AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarExpanded(false)}
              title="Collapse sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    activeChat === chat.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <h3 className="font-medium text-sm truncate">{chat.title}</h3>
                  {chat.lastMessage && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {chat.lastMessage}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(chat.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:hidden",
          sidebarExpanded ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <span className="font-semibold">Turf AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarExpanded(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    activeChat === chat.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <h3 className="font-medium text-sm truncate">{chat.title}</h3>
                  {chat.lastMessage && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {chat.lastMessage}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(chat.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-200",
          sidebarExpanded ? "md:ml-80" : "md:ml-16" // Adjust for sidebar width
        )}
      >
        {/* Mobile Menu Button */}
        <div className="md:hidden p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarExpanded(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <div ref={scrollAreaRef} className="h-full overflow-y-auto">
            <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold mb-3">Welcome to Turf AI</h1>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Your advanced cryptocurrency research assistant. Ask me anything about crypto markets, projects, security, or trends.
                  </p>

                  {/* Suggestion Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="text-2xl mb-2">📊</div>
                      <h3 className="font-medium text-sm">Market Analysis</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Get live prices and market insights
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="text-2xl mb-2">🔍</div>
                      <h3 className="font-medium text-sm">Security Analysis</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Check token safety and smart contracts
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="text-2xl mb-2">📈</div>
                      <h3 className="font-medium text-sm">Social Sentiment</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Analyze Twitter trends and community buzz
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="text-2xl mb-2">⚡</div>
                      <h3 className="font-medium text-sm">DeFi Research</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Explore protocols and trading data
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-32">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-4">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback>
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
                        <div className="max-w-none">
                          {message.role === 'user' ? (
                            <div className="whitespace-pre-wrap">
                              {message.parts?.map((part) =>
                                part.type === 'text' ? part.text : ''
                              ).join('')}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {message.parts?.map((part, index) => {
                                if (part.type === 'text') {
                                  return (
                                    <Response key={`text-${index}`} parseIncompleteMarkdown>
                                      {part.text}
                                    </Response>
                                  )
                                } else if (part.type === 'dynamic-tool') {
                                  const toolPart = part as any
                                  const isComplete = toolPart.state === 'output-available'

                                  return (
                                    <div key={`tool-${index}`} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-sm">
                                      <div className="font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        {isComplete ? 'Fetched' : 'Fetching'} crypto data
                                        {isComplete && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                                      </div>
                                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        Using {toolPart.toolName?.replace('coingeckotokeninfoagent_', '').replace('_', ' ')}
                                      </div>
                                    </div>
                                  )
                                } else if (part.type === 'step-start') {
                                  // Skip step-start parts as they're just workflow indicators
                                  return null
                                } else {
                                  return (
                                    <div key={`unknown-${index}`} className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 text-sm">
                                      <div className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                                        Unknown part type: {part.type}
                                      </div>
                                      <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                                        {JSON.stringify(part, null, 2)}
                                      </div>
                                    </div>
                                  )
                                }
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback>
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-2">Turf AI</div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Responding...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {hasError && (
                    <div className="flex gap-4">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-destructive/10">
                          <Bot className="w-4 h-4 text-destructive" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-2 text-destructive">Error</div>
                        <div className="text-sm text-muted-foreground bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                          {error?.message || 'Something went wrong. Please try again.'}
                          <button
                            onClick={() => window.location.reload()}
                            className="ml-2 text-destructive hover:underline"
                          >
                            Refresh page
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 pointer-events-none">
          <div className="pointer-events-auto">
          <div className="max-w-xl mx-auto">
            {/* Loading Indicator - only show when loading but no response has started yet */}
            {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
              <div className="mb-3 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full border border-border">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>
                    Turf AI is thinking...
                  </span>
                </div>
              </div>
            )}
            {/* Error Indicator */}
            {hasError && (
              <div className="mb-3 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 backdrop-blur-sm px-3 py-2 rounded-full border border-destructive/20">
                  <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center">
                    <span className="text-xs">!</span>
                  </div>
                  <span>Connection failed. Please try again.</span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative bg-black/20 border border-white/10 rounded-lg backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-200">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about crypto..."
                  className="resize-none border-0 focus-visible:ring-0 bg-transparent p-4 pr-12 min-h-[60px] max-h-[200px] overflow-hidden"
                  disabled={isLoading}
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-3 right-3 h-8 w-8 rounded-full"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {input && (
                <div className="absolute -top-12 right-0 hidden md:block">
                  <Badge variant="secondary" className="text-xs">
                    ⏎ Send • ⇧⏎ New line
                  </Badge>
                </div>
              )}
            </form>
          </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarExpanded(false)}
        />
      )}
    </div>
  )
}