"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";
import type { Message, Room } from "@/types/game";

type SessionRow = {
  id: string;
  current_room: Room;
  inventory: string[];
  messages: Message[];
  created_at: string;
  updated_at: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    async function loadSessions() {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .order("updated_at", { ascending: false });

      setSessions((data as SessionRow[]) || []);
    }

    loadSessions();
  }, []);

  return (
    <main className="min-h-screen bg-[#030712] p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-400">
              Histórico de Sessões
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Continue uma partida anterior do AI Escape Lab.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/game")}
            className="rounded-lg border border-green-700 bg-gray-900 px-4 py-2 text-sm text-green-400 hover:bg-green-900/30"
          >
            Voltar ao jogo
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-400">
            Nenhuma sessão encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => router.push(`/game?sessionId=${session.id}`)}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 p-4 text-left transition hover:border-green-700"
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <strong className="text-green-400">
                    Sala: {session.current_room.toUpperCase()}
                  </strong>

                  <span className="text-xs text-gray-500">
                    {new Date(session.updated_at).toLocaleString("pt-BR")}
                  </span>
                </div>

                <p className="text-sm text-gray-400">
                  Mensagens: {session.messages?.length || 0}
                </p>

                <p className="text-sm text-gray-400">
                  Inventário:{" "}
                  {session.inventory?.length
                    ? session.inventory.join(", ")
                    : "vazio"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}