import type { Message } from '@/types/game'
import TypingIndicator from './TypingIndicator'

type ChatMessageProps = {
  message: Message
  isLoading: boolean
}

export default function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isTyping = message.content === '' && isLoading

  return (
    <article className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}>
      <span className="chat-message__sender">{isUser ? '📻 CAMPO' : '🤖 BASE'}</span>

      <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--assistant'}`}>
        {isTyping ? <TypingIndicator /> : message.content}
      </div>
    </article>
  )
}
