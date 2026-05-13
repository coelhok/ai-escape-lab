type InventoryPanelProps = {
  inventory: string[]
}

export default function InventoryPanel({ inventory }: InventoryPanelProps) {
  return (
    <section className="scene-card scene-card--content scene-card--grow">
      <h3 className="panel-label">🎒 Inventário</h3>

      {inventory.length === 0 ? (
        <p className="empty-text">Nenhum item coletado.</p>
      ) : (
        <ul className="inventory-list">
          {inventory.map((item, index) => (
            <li key={`${item}-${index}`} className="inventory-item">
              <span className="inventory-item__icon">◆</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
