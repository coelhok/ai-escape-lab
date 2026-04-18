import { useState, useEffect } from "react"
import { superbase } from "@/lib/superbase/client"
import { Message, Room } from "@/types/game"

export function useSession(sessionIdFromUrl: string | null) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "BASE para CAMPO. Agente, voce esta no laboratorio. Equipamentos quebrados por toda parte. O que voce ve ai? Cambio."
  }])
  const [currentRoom, setCurrentRoom] = useState<Room>("lab")
  const [inventory, setInventory] = useState<string[]>([])

  useEffect(() => {
    async function initSession() {
      const { data: { user } } = await superbase.auth.getUser()
      if (!user) return

      if (sessionIdFromUrl) {
        const { data, error } = await superbase
          .from("sessions")
          .select("*")
          .eq("id", sessionIdFromUrl)
          .single()

        if (!error && data) {
          setSessionId(data.id)
          setMessages(data.messages)
          setCurrentRoom(data.current_room)
          setInventory(data.inventory)
        }
        setInitialized(true)
        return
      }

      const { data, error } = await superbase
        .from("sessions")
        .insert({
          user_id: user.id,
          messages,
          current_room: currentRoom,
          inventory,
        })
        .select()
        .single()

      if (!error && data) setSessionId(data.id)
      setInitialized(true)
    }

    initSession()
  }, [])

  useEffect(() => {
  if (!initialized || !sessionId) return

  async function saveSession() {
    const { error } = await superbase.from("sessions").update({
      messages,
      current_room: currentRoom,
      inventory,
      updated_at: new Date().toISOString(),
    }).eq("id", sessionId!)

    if (error) console.log('❌ Erro ao salvar:', error)
    else console.log('✅ Sessão salva!')

    
  }

  saveSession()
}, [messages, currentRoom, inventory])
  return {
      sessionId,
      messages, setMessages,
      currentRoom, setCurrentRoom,
      inventory, setInventory,
    }
  }

