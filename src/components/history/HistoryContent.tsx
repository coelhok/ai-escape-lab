import type { Session } from '@/types/game'
import EmptyHistoryState from './EmptyHistoryState'
import HistorySessionCard from './HistorySessionCard'

type HistoryContentProps = {
  sessions: Session[]
  isLoading: boolean
  onBackToGame: () => void
  onOpenSession: (sessionId: string) => void
}

export default function HistoryContent({
  sessions,
  isLoading,
  onBackToGame,
  onOpenSession,
}: HistoryContentProps) {
  if (isLoading) {
    return <div className="center-state">Carregando...</div>
  }

  if (sessions.length === 0) {
    return <EmptyHistoryState onBackToGame={onBackToGame} />
  }

  return (
    <div className="history-list">
      {sessions.map((session) => (
        <HistorySessionCard
          key={session.id}
          session={session}
          onOpenSession={onOpenSession}
        />
      ))}
    </div>
  )
}
