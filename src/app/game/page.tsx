'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { superbase } from '@/lib/superbase/client'
import ScenePanel from '@/components/game/ScenePanel'
import RadioChat from '@/components/game/RadioChat'

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function GamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionIdFromUrl = searchParams.get('session')

  const [currentRoom, setCurrentRoom] = useState('lab')
  const [inventory, setInventory] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'BASE para CAMPO. Agente, você está no laboratório. Equipamentos quebrados por toda parte. Consigo ver uma porta de metal ao norte. O que você vê aí? Câmbio.'
    }
  ])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function initSession() {
      console.log('🔍 sessionIdFromUrl:', sessionIdFromUrl)

      const { data: { user } } = await superbase.auth.getUser()
      if (!user) return

      if (sessionIdFromUrl) {
        console.log('📂 Carregando sessão existente...')
        const { data, error } = await superbase
          .from('sessions')
          .select('*')
          .eq('id', sessionIdFromUrl)
          .single()

        console.log('📦 Sessão carregada:', data)
        console.log('❌ Erro:', error)

        if (!error && data) {
          setSessionId(data.id)
          setMessages(data.messages)
          setCurrentRoom(data.current_room)
          setInventory(data.inventory)
        }
        setInitialized(true)
        return
      }

      console.log('🆕 Criando sessão nova...')
      const { data, error } = await superbase
        .from('sessions')
        .insert({
          user_id: user.id,
          messages,
          current_room: currentRoom,
          inventory,
        })
        .select()
        .single()

      console.log('✅ Sessão criada:', data?.id)
      console.log('❌ Erro:', error)

      if (!error && data) {
        setSessionId(data.id)
      }
      setInitialized(true)
    }

    initSession()
  }, [])

  useEffect(() => {
    if (!initialized || !sessionId) return

    async function saveSession() {
      await superbase
        .from('sessions')
        .update({
          messages,
          current_room: currentRoom,
          inventory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
    }

    saveSession()
  }, [messages, currentRoom, inventory])

  async function handleLogout() {
    await superbase.auth.signOut()
    router.push('/login')
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
          <button
            onClick={() => router.push('/history')}
            className="text-gray-400 hover:text-green-400 text-sm transition-colors"
          >
            📋 Histórico
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 text-sm transition-colors"
          >
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