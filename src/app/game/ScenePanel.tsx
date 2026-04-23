'use client'

import { useState, useEffect, useRef } from 'react'

type ScenePanelProps = {
  currentRoom: string
  inventory: string[]
}

const ROOMS: Record<string, { name: string; description: string; emoji: string }> = {
  lab: {
    emoji: '🔬',
    name: 'Laboratório',
    description: 'Um laboratório escuro e abandonado. Equipamentos quebrados espalhados pelo chão. Uma porta de metal ao norte e uma janela gradeada ao leste.',
  },
  corridor: {
    emoji: '🚪',
    name: 'Corredor',
    description: 'Um corredor longo e mal iluminado. O cheiro de ozônio no ar. Portas numeradas dos dois lados.',
  },
  server_room: {
    emoji: '🖥️',
    name: 'Sala de Servidores',
    description: 'Servidores zumbindo. Luzes piscando em vermelho. Um terminal desbloqueado no canto.',
  },
  exit: {
    emoji: '🚨',
    name: 'Saída',
    description: 'A saída! Uma porta reforçada com um painel de código numérico. Você está quase lá!',
  },
}

export default function ScenePanel({ currentRoom, inventory }: ScenePanelProps) {
  const room = ROOMS[currentRoom] || ROOMS.lab
  const [imageUrl, setImageUrl] = useState('')
  const [imageLoading, setImageLoading] = useState(true)
  const isFetchingRef = useRef(false)

  useEffect(() => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setImageLoading(true)
    setImageUrl('')

    fetch(`/api/room-image?room=${currentRoom}`)
      .then((res) => res.json())
      .then((data) => {
        setImageUrl(data.url)
        console.log(data.cached ? '⚡ Cache!' : '🎨 Imagem gerada!')
      })
      .catch(() => setImageLoading(false))
      .finally(() => {
        isFetchingRef.current = false
      })

  }, [currentRoom])

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">

      {/* Imagem da sala */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="relative w-full h-48">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
              <span className="text-gray-600 text-xs font-mono">Gerando cena...</span>
            </div>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={room.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              className={`transition-opacity duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(false)}
              onError={() => console.log('Erro ao carregar imagem:', imageUrl)}
            />
          )}
        </div>
      </div>

      {/* Descrição da sala */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{room.emoji}</span>
          <h2 className="text-green-400 font-bold">{room.name}</h2>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          {room.description}
        </p>
      </div>

      {/* Mapa */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-gray-400 text-xs font-semibold uppercase mb-3">
          🗺️ Mapa
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(ROOMS).map(([id, r]) => (
            <div
              key={id}
              className={`text-xs px-2 py-1 rounded text-center ${
                id === currentRoom
                  ? 'bg-green-900 text-green-400 border border-green-700'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {r.emoji} {r.name}
            </div>
          ))}
        </div>
      </div>

      {/* Inventário */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex-1">
        <h3 className="text-gray-400 text-xs font-semibold uppercase mb-3">
          🎒 Inventário
        </h3>
        {inventory.length === 0 ? (
          <p className="text-gray-600 text-sm">Nenhum item coletado.</p>
        ) : (
          <ul className="space-y-2">
            {inventory.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2"
              >
                <span className="text-yellow-400">◆</span>
                <span className="text-gray-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}