import type { RefObject } from 'react'
import type { Message } from '@/types/game'
import ChatMessage from './ChatMessage'

type MessageListProps = {
  messages: Message[]
  isLoading: boolean
  bottomRef: RefObject<HTMLDivElement | null>
}

export default function MessageList({ messages, isLoading, bottomRef }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <ChatMessage
          key={`${message.role}-${index}`}
          message={message}
          isLoading={isLoading}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  )
}
