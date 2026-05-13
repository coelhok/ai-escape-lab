'use client'

import { useEffect, useState } from 'react'
import { INITIAL_ROOM, ROOMS } from '@/constants/rooms'
import type { Room } from '@/types/game'
import InventoryPanel from './scene/InventoryPanel'
import RoomDescription from './scene/RoomDescription'
import RoomMap from './scene/RoomMap'
import SceneImage from './scene/SceneImage'

type ScenePanelProps = {
  currentRoom: Room
  inventory: string[]
}

export default function ScenePanel({ currentRoom, inventory }: ScenePanelProps) {
  const room = ROOMS[currentRoom] || ROOMS[INITIAL_ROOM]
  const [imageState, setImageState] = useState<{
    room: Room | null
    url: string
    loaded: boolean
    failed: boolean
  }>({
    room: null,
    url: '',
    loaded: false,
    failed: false,
  })

  const imageUrl = imageState.room === currentRoom ? imageState.url : ''
  const imageLoading =
    imageState.room !== currentRoom || (!imageState.loaded && !imageState.failed)

  useEffect(() => {
    let ignore = false

    fetch(`/api/room-image?room=${currentRoom}`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return

        setImageState({
          room: currentRoom,
          url: data.url || '',
          loaded: false,
          failed: !data.url,
        })
      })
      .catch(() => {
        if (ignore) return

        setImageState({
          room: currentRoom,
          url: '',
          loaded: false,
          failed: true,
        })
      })

    return () => {
      ignore = true
    }
  }, [currentRoom])

  return (
    <div className="scene-panel">
      <SceneImage
        imageUrl={imageUrl}
        imageLoading={imageLoading}
        alt={room.name}
        onLoad={() =>
          setImageState((state) =>
            state.room === currentRoom ? { ...state, loaded: true } : state
          )
        }
        onError={() =>
          setImageState((state) =>
            state.room === currentRoom ? { ...state, failed: true } : state
          )
        }
      />

      <RoomDescription room={room} />
      <RoomMap currentRoom={currentRoom} />
      <InventoryPanel inventory={inventory} />
    </div>
  )
}
