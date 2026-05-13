type EmptyHistoryStateProps = {
  onBackToGame: () => void
}

export default function EmptyHistoryState({ onBackToGame }: EmptyHistoryStateProps) {
  return (
    <div className="center-state center-state--empty">
      <p className="empty-icon">📭</p>
      <p>Nenhuma sessão encontrada.</p>

      <button type="button" onClick={onBackToGame} className="link-button">
        Iniciar uma partida →
      </button>
    </div>
  )
}
