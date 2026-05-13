import type { Dispatch, SetStateAction } from 'react'
import type { Message, Room } from '@/types/game'
import GameHeader from './GameHeader'
import RadioChat from './RadioChat'
import ScenePanel from './ScenePanel'

type GameLayoutProps = {
  currentRoom: Room
  inventory: string[]
  messages: Message[]
  setMessages: Dispatch<SetStateAction<Message[]>>
  onRoomChange: (room: Room) => void
  onInventoryChange: (inventory: string[]) => void
  onHistoryClick: () => void
  onLogout: () => void
}

export default function GameLayout({
  currentRoom,
  inventory,
  messages,
  setMessages,
  onRoomChange,
  onInventoryChange,
  onHistoryClick,
  onLogout,
}: GameLayoutProps) {
  return (
    <div className="game-page">
      <GameHeader
        currentRoom={currentRoom}
        onHistoryClick={onHistoryClick}
        onLogout={onLogout}
      />

      <main className="game-main">
        <aside className="game-sidebar">
          <ScenePanel currentRoom={currentRoom} inventory={inventory} />
        </aside>

        <section className="game-chat-area">
          <RadioChat
            messages={messages}
            setMessages={setMessages}
            currentRoom={currentRoom}
            inventory={inventory}
            onRoomChange={onRoomChange}
            onInventoryChange={onInventoryChange}
          />
        </section>
      </main>
    </div>
  )
}
