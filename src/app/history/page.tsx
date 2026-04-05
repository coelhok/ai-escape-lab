'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { superbase } from '@/lib/superbase/client'

type Session = {
  id: string
  current_room: string
  messages: { role: string; content: string }[]
  inventory: string[]
  created_at: string
  updated_at: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
  async function loadSessions() {
    console.log('🔍 Carregando sessões...')

    const { data, error } = await superbase
      .from('sessions')
      .select('*')
      .order('updated_at', { ascending: false })

    console.log('📦 Data:', data)
    console.log('❌ Error:', error)

    if (!error && data) {
      setSessions(data)
    }
    setIsLoading(false)
  }

  loadSessions()
}, [])

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const ROOM_NAMES: Record<string, string> = {
    lab: '🔬 Laboratório',
    corridor: '🚪 Corredor',
    server_room: '🖥️ Sala de Servidores',
    exit: '🚨 Saída',
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-green-400 text-xl">📋</span>
          <h1 className="text-white font-bold text-lg">Histórico de Sessões</h1>
        </div>
        <button
          onClick={() => router.push('/game')}
          className="text-gray-400 hover:text-green-400 text-sm transition-colors"
        >
          ← Voltar ao jogo
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center text-gray-500 mt-20">Carregando...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-4xl mb-4">📭</p>
            <p>Nenhuma sessão encontrada.</p>
            <button
              onClick={() => router.push('/game')}
              className="mt-4 text-green-400 hover:text-green-300 text-sm"
            >
              Iniciar uma partida →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => router.push(`/game?session=${session.id}`)}
                className="bg-gray-900 border border-gray-800 hover:border-green-800 rounded-xl p-5 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-green-400 font-mono text-sm">
                    {ROOM_NAMES[session.current_room] || session.current_room}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {formatDate(session.updated_at)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>💬 {session.messages.length} mensagens</span>
                  <span>🎒 {session.inventory.length > 0 ? session.inventory.join(', ') : 'sem itens'}</span>
                </div>

                {/* Preview da última mensagem */}
                {session.messages.length > 0 && (
                  <p className="text-gray-500 text-xs mt-3 truncate">
                    {session.messages[session.messages.length - 1].content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}