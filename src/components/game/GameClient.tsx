'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { INITIAL_MESSAGES, INITIAL_ROOM, isRoom } from '@/constants/rooms'
import { supabase } from '@/lib/supabase/client'
import type { Message, Room } from '@/types/game'
import GameLayout from './GameLayout'

export default function GameClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionIdFromUrl = searchParams.get('session')

  const [currentRoom, setCurrentRoom] = useState<Room>(INITIAL_ROOM)
  const [inventory, setInventory] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([...INITIAL_MESSAGES])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function initSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (sessionIdFromUrl) {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionIdFromUrl)
          .single()

        if (!error && data) {
          setSessionId(data.id)
          setMessages(data.messages || [...INITIAL_MESSAGES])
          setCurrentRoom(isRoom(data.current_room) ? data.current_room : INITIAL_ROOM)
          setInventory(data.inventory || [])
        }

        setInitialized(true)
        return
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          messages: [...INITIAL_MESSAGES],
          current_room: INITIAL_ROOM,
          inventory: [],
        })
        .select()
        .single()

      if (!error && data) {
        setSessionId(data.id)
      }

      setInitialized(true)
    }

    initSession()
  }, [sessionIdFromUrl])

  useEffect(() => {
    if (!initialized || !sessionId) return

    async function saveSession() {
      await supabase
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
  }, [initialized, sessionId, messages, currentRoom, inventory])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <GameLayout
      currentRoom={currentRoom}
      inventory={inventory}
      messages={messages}
      setMessages={setMessages}
      onRoomChange={setCurrentRoom}
      onInventoryChange={setInventory}
      onHistoryClick={() => router.push('/history')}
      onLogout={handleLogout}
    />
  )
}
