'use client' // Diz pro Next.js que essa página roda no navegador

import { useState } from 'react' // useState = guarda informações que mudam
import ScenePanel from './ScenePanel'
import RadioChat from './RadioChat'
// Tipo que define como é uma mensagem do chat
export type Message = {
  role: 'user' | 'assistant' // quem mandou: jogador ou IA
  content: string            // o texto da mensagem
}

export default function GamePage() {
  // Estado do jogo — são as informações que mudam durante o jogo
  const [currentRoom, setCurrentRoom] = useState('lab')           // sala atual
  const [inventory, setInventory] = useState(['lanterna'])        // itens do jogador
  const [messages, setMessages] = useState<Message[]>([          // histórico do chat
    {
      role: 'assistant',
      content: 'BASE para CAMPO. Agente, você está no laboratório. Equipamentos quebrados por toda parte. Consigo ver uma porta de metal ao norte. O que você vê aí? Câmbio.'
    }
  ])

  return (
    // min-h-screen = ocupa a tela toda
    // bg-gray-950 = fundo bem escuro
    // flex flex-col = organiza em coluna
    <div className="min-h-screen bg-gray-950 flex flex-col">
      
      {/* Cabeçalho */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-green-400 text-xl">📻</span>
          <h1 className="text-white font-bold text-lg">AI Escape Lab</h1>
          {/* Badge mostrando a sala atual */}
          <span className="bg-gray-800 text-green-400 text-xs px-3 py-1 rounded-full border border-green-900">
            {currentRoom.toUpperCase()}
          </span>
        </div>
        <button className="text-gray-400 hover:text-red-400 text-sm transition-colors">
          Sair
        </button>
      </header>

      {/* Área principal dividida em dois painéis */}
      {/* flex-1 = ocupa o espaço restante da tela */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Painel esquerdo — Cenário e Inventário */}
        {/* w-80 = largura fixa de 320px */}
        <div className="w-80 border-r border-gray-800 flex-shrink-0">
          <ScenePanel
            currentRoom={currentRoom}
            inventory={inventory}
          />
        </div>

        {/* Painel direito — Chat estilo rádio */}
        {/* flex-1 = ocupa o resto do espaço */}
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