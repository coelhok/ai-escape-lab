import type { Room } from '@/types/game'

type GameHeaderProps = {
  currentRoom: Room
  onHistoryClick: () => void
  onLogout: () => void
}

export default function GameHeader({ currentRoom, onHistoryClick, onLogout }: GameHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__icon">📻</span>
        <h1 className="app-header__title">AI Escape Lab</h1>
        <span className="room-badge">{currentRoom.toUpperCase()}</span>
      </div>

      <div className="app-header__actions">
        <button type="button" onClick={onHistoryClick} className="ghost-button ghost-button--success">
          📋 Histórico
        </button>
        <button type="button" onClick={onLogout} className="ghost-button ghost-button--danger">
          Sair
        </button>
      </div>
    </header>
  )
}
