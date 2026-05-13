type HistoryHeaderProps = {
  onBackToGame: () => void
}

export default function HistoryHeader({ onBackToGame }: HistoryHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__icon">📋</span>
        <h1 className="app-header__title">Histórico de Sessões</h1>
      </div>

      <button type="button" onClick={onBackToGame} className="ghost-button ghost-button--success">
        ← Voltar ao jogo
      </button>
    </header>
  )
}
