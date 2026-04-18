"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import ScenePanel from "@/components/game/ScenePanel"
import RadioChat from "@/components/game/RadioChat"
import { superbase } from "@/lib/superbase/client"

export type Message = {
  role: "user" | "assistant"
  content: string
}

export default function GamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionIdFromUrl = searchParams.get("session")

  const {
    messages, setMessages,
    currentRoom, setCurrentRoom,
    inventory, setInventory,
  } = useSession(sessionIdFromUrl)

  async function handleLogout() {
    await superbase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-green-400 text-xl">📻</span>
          <h1 className="text-white font-bold text-lg">AI Escape Lab</h1>
          <span className="bg-gray-800 text-green-400 text-xs px-3 py-1 rounded-full border border-green-900">
            {currentRoom.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/history")} className="text-gray-400 hover:text-green-400 text-sm transition-colors">
            📋 Historico
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm transition-colors">
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-gray-800 flex-shrink-0">
          <ScenePanel currentRoom={currentRoom} inventory={inventory} />
        </div>
        <div className="flex-1">
          <RadioChat
            messages={messages}
            setMessages={setMessages}
            currentRoom={currentRoom}
            inventory={inventory}
            onRoomChange={setCurrentRoom}
            onInventoryChange={setInventory}
          />
        </div>
      </main>
    </div>
  )
}
