'use client'

import { useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { isRoom } from '@/constants/rooms'
import type { Message, Room } from '@/types/game'
import ChatInput from './radio/ChatInput'
import MessageList from './radio/MessageList'
import RadioHeader from './radio/RadioHeader'

type RadioChatProps = {
  messages: Message[]
  setMessages: Dispatch<SetStateAction<Message[]>>
  currentRoom: Room
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

    setMessages([...updatedMessages, { role: 'assistant', content: '' }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, currentRoom, inventory }),
      })

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

          try {
            const data = JSON.parse(raw)

            if (data.type === 'text') {
              fullText += data.content
              setMessages([...updatedMessages, { role: 'assistant', content: fullText }])
            }

            if (data.type === 'tool_call') {
              handleToolCall(data)
            }
          } catch {
            // Ignora linhas inválidas do stream.
          }
        }
      }
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'BASE para CAMPO. Perdi o sinal. Tente novamente. Câmbio.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleToolCall(data: {
    tool?: string
    result?: { new_room?: string; item?: string }
  }) {
    if (data.tool === 'change_room' && data.result?.new_room && isRoom(data.result.new_room)) {
      onRoomChange(data.result.new_room)
    }

    if (data.tool === 'check_inventory' && data.result?.item) {
      onInventoryChange([...inventory, data.result.item])
    }
  }

  return (
    <div className="radio-chat">
      <RadioHeader />
      <MessageList messages={messages} isLoading={isLoading} bottomRef={bottomRef} />
      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={sendMessage}
      />
    </div>
  )
}
