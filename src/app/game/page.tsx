"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import ScenePanel from "@/components/game/ScenePanel";
import RadioChat from "@/components/game/RadioChat";
import type { Message, Room } from "@/types/game";

export default function GamePage() {
  const [currentRoom, setCurrentRoom] = useState<Room>("lab");
  const [inventory, setInventory] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scene = (
    <ScenePanel
      currentRoom={currentRoom}
      inventory={inventory}
    />
  );

  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#030712] text-white">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-green-700 bg-gray-900 text-green-400 shadow-lg lg:hidden"
        aria-label="Abrir mapa e inventário"
      >
        <Menu size={24} />
      </button>

      <div className="flex h-screen w-full overflow-hidden">
        <aside className="hidden h-screen w-80 shrink-0 overflow-y-auto border-r border-gray-800 bg-[#030712] lg:block">
          {scene}
        </aside>

        <section className="h-screen min-w-0 flex-1 overflow-hidden pt-16 lg:pt-0">
          <RadioChat
            currentRoom={currentRoom}
            inventory={inventory}
            messages={messages}
            setMessages={setMessages}
            onRoomChange={setCurrentRoom}
            onInventoryChange={setInventory}
          />
        </section>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/75"
            aria-label="Fechar menu"
          />

          <aside className="absolute left-0 top-0 h-full w-[86vw] max-w-sm overflow-y-auto border-r border-green-700 bg-[#030712] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-green-400">
                Mapa e Inventário
              </h2>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-700 bg-gray-900 text-green-400"
                aria-label="Fechar menu"
              >
                <X size={22} />
              </button>
            </div>

            {scene}
          </aside>
        </div>
      )}
    </main>
  );
}