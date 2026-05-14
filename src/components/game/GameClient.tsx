"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, RotateCcw, History, LogOut } from "lucide-react";

import { createGameState, type GameState } from "@/lib/game/createGameState";
import ScenePanel from "@/components/game/ScenePanel";
import RadioChat from "@/components/game/RadioChat";
import { supabase } from "@/lib/supabase/client";
import type { Message, Room } from "@/types/game";

export default function GameClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room>("lab");
  const [sceneState, setSceneState] = useState("lab_locked");
  const [timeLeft, setTimeLeft] = useState(600);
  const [gameOver, setGameOver] = useState(false);

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
          setSceneState(data.scene_state || "lab_locked");
          setTimeLeft(data.time_left || 600);
          setGameState((data.game_state as GameState) || createGameState());
          setLoaded(true);
          return;
        }
      }

      const initialGameState = createGameState();

      const { data, error } = await supabase
        .from("sessions")
        .insert({
          current_room: "lab",
          inventory: [],
          messages: [],
          scene_state: "lab_locked",
          time_left: 600,
          game_state: initialGameState,
        })
        .select()
        .single();

      if (!error && data) {
        setSessionId(data.id);
        setGameState(initialGameState);
        router.replace(`/game?sessionId=${data.id}`);
      }

      setLoaded(true);
    }

    loadOrCreateSession();
  }, [searchParams, router]);

  useEffect(() => {
    if (!loaded || !sessionId) return;

    async function saveSession() {
      await supabase
        .from("sessions")
        .update({
          current_room: currentRoom,
          inventory,
          messages,
          scene_state: sceneState,
          time_left: timeLeft,
          game_state: gameState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
    }

    saveSession();
  }, [
    loaded,
    sessionId,
    currentRoom,
    inventory,
    messages,
    sceneState,
    timeLeft,
    gameState,
  ]);

  useEffect(() => {
    if (!loaded || gameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameOver(true);

          setMessages((old) => [
            ...old,
            {
              role: "assistant",
              content:
                "🚨 ALERTA CRÍTICO. O reator entrou em colapso e o laboratório explodiu. MISSÃO FALHOU.",
            },
          ]);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loaded, gameOver]);

  async function handleNewGame() {
    setLoaded(false);

    const initialGameState = createGameState();

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        current_room: "lab",
        inventory: [],
        messages: [],
        scene_state: "lab_locked",
        time_left: 600,
        game_state: initialGameState,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Erro ao criar nova sessão:", error);
      setLoaded(true);
      return;
    }

    setSessionId(data.id);
    setGameState(initialGameState);
    setCurrentRoom("lab");
    setInventory([]);
    setMessages([]);
    setSceneState("lab_locked");
    setTimeLeft(600);
    setGameOver(false);

    router.push(`/game?sessionId=${data.id}`);
    setLoaded(true);
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  const scene = (
    <ScenePanel
      currentRoom={currentRoom}
      inventory={inventory}
      sceneState={sceneState}
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

        <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-gray-800 bg-[#020617] px-4 py-3">
            <div className="flex items-center gap-3 pl-14 lg:pl-0">
              <h1 className="text-base font-bold text-white sm:text-lg">
                🤖 AI Escape Lab
              </h1>

              <span className="rounded-full border border-green-700 bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-400">
                {currentRoom.toUpperCase()}
              </span>

              <span className="rounded-full border border-red-700 bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-400">
                ⏱ {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
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
                sceneState={sceneState}
                onSceneStateChange={setSceneState}
                gameState={gameState}
                onGameStateChange={setGameState}
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