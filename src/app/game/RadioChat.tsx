'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from '@/app/game/page'
import { Room } from '@/types/game'

type RadioChatProps = {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  currentRoom: string
  inventory: string[]
  onRoomChange: (room: Room) => void
  onInventoryChange: (inventory: string[]) => void
}

export default function RadioChat({
  messages,
  setMessages,
  currentRoom,
  inventory,
  onRoomChange,
  onInventoryChange,
}: RadioChatProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]

    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    setMessages([...updatedMessages, { role: 'assistant', content: '' }])

    try {
      console.log('📡 Enviando para /api/chat...')

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, currentRoom, inventory }),
      })

      console.log('📡 Status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
             console.log('📦 Linha recebida:', raw)
          try {
            const data = JSON.parse(raw)
                console.log('✅ Data parseada:', data)
            if (data.type === 'text') {
              fullText += data.content
              setMessages([...updatedMessages, { role: 'assistant', content: fullText }])
            }

            if (data.type === 'tool_call') {
              if (data.tool === 'change_room') {
                onRoomChange(data.result.new_room)
              }
              if (data.tool === 'check_inventory' && data.result.item) {
                onInventoryChange([...inventory, data.result.item])
              }
            }

          } catch {
            // ignora linhas inválidas
          }
        }
      }

    } catch (err) {
      console.log('❌ Erro:', err)
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: 'BASE para CAMPO. Perdi o sinal. Tente novamente. Câmbio.' }
      ])
    }

    setIsLoading(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span className="text-green-400 text-sm font-mono">CANAL SEGURO — CRIPTOGRAFADO</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-xs text-gray-600 font-mono">
              {msg.role === 'user' ? '📻 CAMPO' : '🤖 BASE'}
            </span>
            <div
              className={`max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-green-900 text-green-100 border border-green-700'
                  : 'bg-gray-800 text-gray-200 border border-gray-700'
              }`}
            >
              {msg.content === '' && isLoading ? (
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </span>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Transmitir mensagem para BASE... Câmbio."
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500 disabled:opacity-50 transition-colors font-mono"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-3 rounded-xl transition-colors font-mono text-sm"
          >
            {isLoading ? '...' : '📻'}
          </button>
        </div>
      </div>
    </div>
  )
}