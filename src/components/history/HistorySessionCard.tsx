import { ROOMS } from '@/constants/rooms'
import { formatDate } from '@/lib/game/formatDate'
import type { Session } from '@/types/game'

type HistorySessionCardProps = {
  session: Session
  onOpenSession: (sessionId: string) => void
}

export default function HistorySessionCard({ session, onOpenSession }: HistorySessionCardProps) {
  const room = ROOMS[session.current_room]
  const roomName = room ? `${room.emoji} ${room.name}` : session.current_room
  const lastMessage = session.messages[session.messages.length - 1]?.content
  const inventoryText = session.inventory.length > 0 ? session.inventory.join(', ') : 'sem itens'

  return (
    <button
      type="button"
      onClick={() => onOpenSession(session.id)}
      className="history-card"
    >
      <div className="history-card__header">
        <span className="history-card__room">{roomName}</span>
        <span className="history-card__date">{formatDate(session.updated_at)}</span>
      </div>

      <div className="history-card__meta">
        <span>💬 {session.messages.length} mensagens</span>
        <span>🎒 {inventoryText}</span>
      </div>

      {lastMessage && <p className="history-card__preview">{lastMessage}</p>}
    </button>
  )
}
