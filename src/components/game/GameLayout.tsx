"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import RadioChat from "./RadioChat";
import ScenePanel from "./ScenePanel";
import type { Message, Room } from "@/types/game";

type GameLayoutProps = {
  currentRoom: Room;
  inventory: string[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onRoomChange: React.Dispatch<React.SetStateAction<Room>>;
  onInventoryChange: React.Dispatch<React.SetStateAction<string[]>>;
  onHistoryClick: () => void;
  onLogout: () => Promise<void>;
};

export default function GameLayout({
  currentRoom,
  inventory,
  messages,
  setMessages,
  onRoomChange,
  onInventoryChange,
  onHistoryClick: _onHistoryClick,
  onLogout: _onLogout,
}: GameLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scene = (
    <ScenePanel
      currentRoom={currentRoom}
      inventory={inventory}
    />
  );

  const chat = (
    <RadioChat
      currentRoom={currentRoom}
      inventory={inventory}
      messages={messages}
      setMessages={setMessages}
      onRoomChange={onRoomChange}
      onInventoryChange={onInventoryChange}
    />
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-96 border-r border-green-500/30 bg-zinc-950 p-4 lg:block">
          {scene}
        </aside>

        <section className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-green-500/30 bg-zinc-950 p-4 lg:hidden">
            <h1 className="text-lg font-bold text-green-400">
              AI Escape Lab
            </h1>

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-green-500/40 p-2 text-green-400"
              aria-label="Abrir mapa e inventário"
            >
              <Menu size={24} />
            </button>
          </header>

          <div className="flex-1 overflow-hidden">
            {chat}
          </div>
        </section>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto border-r border-green-500/30 bg-zinc-950 p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-green-400">
                Mapa e Inventário
              </h2>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg border border-green-500/40 p-2 text-green-400"
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