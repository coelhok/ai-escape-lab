import type { Session } from '@/types/game'
import HistoryContent from './HistoryContent'
import HistoryHeader from './HistoryHeader'

type HistoryLayoutProps = {
  sessions: Session[]
  isLoading: boolean
  onBackToGame: () => void
  onOpenSession: (sessionId: string) => void
}

export default function HistoryLayout({
  sessions,
  isLoading,
  onBackToGame,
  onOpenSession,
}: HistoryLayoutProps) {
  return (
    <div className="history-page">
      <HistoryHeader onBackToGame={onBackToGame} />

      <main className="history-main">
        <HistoryContent
          sessions={sessions}
          isLoading={isLoading}
          onBackToGame={onBackToGame}
          onOpenSession={onOpenSession}
        />
      </main>
    </div>
  )
}
