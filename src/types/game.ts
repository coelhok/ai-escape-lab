export type Message = {
  role: "user" | "assistant"
  content: string
}

export type Room = "lab" | "corridor" | "server_room" | "exit"

export type RoomInfo = {
  id?: Room
  name: string
  description: string
  emoji: string
  imageUrl?: string
  objects?: string[]
}

export type Session = {
  id: string
  current_room: Room
  messages: Message[]
  inventory: string[]
  created_at: string
  updated_at: string
}