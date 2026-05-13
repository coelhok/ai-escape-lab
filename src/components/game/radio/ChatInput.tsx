type ChatInputProps = {
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
}

export default function ChatInput({ input, isLoading, onInputChange, onSend }: ChatInputProps) {
  return (
    <footer className="chat-input-area">
      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && onSend()}
          placeholder="Transmitir mensagem para BASE... Câmbio."
          disabled={isLoading}
          className="chat-input"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className="send-button"
        >
          {isLoading ? '...' : '📻'}
        </button>
      </div>
    </footer>
  )
}
