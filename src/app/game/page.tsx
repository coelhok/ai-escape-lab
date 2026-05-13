"use client";

import { Suspense } from "react";
import GameClient from "@/components/game/GameClient";

function GameLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030712] text-green-400">
      Carregando AI Escape Lab...
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<GameLoading />}>
      <GameClient />
    </Suspense>
  );
}