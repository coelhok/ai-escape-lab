import { ROOMS } from '@/constants/rooms'
import type { Room } from '@/types/game'

type RoomMapProps = {
  currentRoom: Room
}

export default function RoomMap({ currentRoom }: RoomMapProps) {
  return (
    <section className="scene-card scene-card--content">
      <h3 className="panel-label">🗺️ Mapa</h3>

      <div className="room-map-grid">
        {Object.entries(ROOMS).map(([id, room]) => (
          <div
            key={id}
            className={`room-map-item ${id === currentRoom ? 'room-map-item--active' : ''}`}
          >
            {room.emoji} {room.name}
          </div>
        ))}
      </div>
    </section>
  )
}
