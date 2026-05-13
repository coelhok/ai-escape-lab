"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, RotateCcw, History, LogOut } from "lucide-react";

import ScenePanel from "@/components/game/ScenePanel";
import RadioChat from "@/components/game/RadioChat";
import { supabase } from "@/lib/supabase/client";
import type { Message, Room } from "@/types/game";

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room>("lab");
  const [inventory, setInventory] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadOrCreateSession() {
      const idFromUrl = searchParams.get("sessionId");

      if (idFromUrl) {
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("id", idFromUrl)
          .single();

        if (!error && data) {
          setSessionId(data.id);
          setCurrentRoom((data.current_room as Room) || "lab");
          setInventory((data.inventory as string[]) || []);
          setMessages((data.messages as Message[]) || []);
          setLoaded(true);
          return;
        }
      }

      const { data, error } = await supabase
        .from("sessions")
        .insert({
          current_room: "lab",
          inventory: [],
          messages: [],
        })
        .select()
        .single();

      if (!error && data) {
        setSessionId(data.id);
      }

      setLoaded(true);
    }

    loadOrCreateSession();
  }, [searchParams]);

  useEffect(() => {
    if (!loaded || !sessionId) return;

    async function saveSession() {
      await supabase
        .from("sessions")
        .update({
          current_room: currentRoom,
          inventory,
          messages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
    }

    saveSession();
  }, [loaded, sessionId, currentRoom, inventory, messages]);

  async function handleNewGame() {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        current_room: "lab",
        inventory: [],
        messages: [],
      })
      .select()
      .single();

    if (!error && data) {
      setSessionId(data.id);
      setCurrentRoom("lab");
      setInventory([]);
      setMessages([]);
      router.replace(`/game?sessionId=${data.id}`);
    }
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  const scene = (
    <ScenePanel currentRoom={currentRoom} inventory={inventory} />
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

        <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-gray-800 bg-[#020617] px-4 py-3">
            <div className="flex items-center gap-3 pl-14 lg:pl-0">
              <h1 className="text-base font-bold text-white sm:text-lg">
                🤖 AI Escape Lab
              </h1>

              <span className="rounded-full border border-green-700 bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-400">
                {currentRoom.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/history")}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 transition hover:border-green-700 hover:text-green-400"
              >
                <History size={16} />
                <span className="hidden sm:inline">Histórico</span>
              </button>

              <button
                type="button"
                onClick={handleNewGame}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 transition hover:border-blue-700 hover:text-blue-400"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Novo Jogo</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 transition hover:border-red-700 hover:text-red-400"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-hidden">
            <RadioChat
              currentRoom={currentRoom}
              inventory={inventory}
              messages={messages}
              setMessages={setMessages}
              onRoomChange={setCurrentRoom}
              onInventoryChange={setInventory}
            />
          </div>
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