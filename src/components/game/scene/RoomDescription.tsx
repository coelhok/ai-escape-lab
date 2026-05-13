import type { RoomInfo } from '@/types/game'

type RoomDescriptionProps = {
  room: RoomInfo
}

export default function RoomDescription({ room }: RoomDescriptionProps) {
  return (
    <section className="scene-card scene-card--content">
      <div className="scene-title-row">
        <span className="scene-title-row__emoji">{room.emoji}</span>
        <h2 className="scene-title-row__title">{room.name}</h2>
      </div>

      <p className="scene-description">{room.description}</p>
    </section>
  )
}
