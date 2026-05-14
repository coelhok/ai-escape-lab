"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { isRoom } from "@/constants/rooms";
import type { Message, Room } from "@/types/game";
import type { GameState } from "@/lib/game/createGameState";

import ChatInput from "@/components/game/radio/ChatInput";
import MessageList from "@/components/game/radio/MessageList";
import RadioHeader from "@/components/game/radio/RadioHeader";

type RadioChatProps = {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  currentRoom: Room;
  inventory: string[];
  sceneState: string;
  gameState: GameState | null;
  onRoomChange: (room: Room) => void;
  onInventoryChange: (inventory: string[]) => void;
  onSceneStateChange: (sceneState: string) => void;
  onGameStateChange: (gameState: GameState) => void;
};

type StreamEvent = {
  type?: "text" | "state" | "done" | "error";
  content?: string;
  message?: string;
  currentRoom?: string;
  inventory?: string[];
  sceneState?: string;
  gameState?: GameState;
};

const TUTORIAL_MESSAGE =
  "BASE para CAMPO. Você acorda no chão frio de um laboratório subterrâneo sem lembrar como chegou aí. As luzes piscam, o sistema de emergência está ativo e todas as portas foram seladas após uma falha crítica. Seu objetivo é explorar o ambiente, encontrar pistas, resolver os sistemas de segurança e escapar antes que o reator entre em colapso. Câmbio.";

export default function RadioChat({
  messages,
  setMessages,
  currentRoom,
  inventory,
  sceneState,
  gameState,
  onRoomChange,
  onInventoryChange,
  onSceneStateChange,
  onGameStateChange,
}: RadioChatProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length > 0) return;

    setMessages([
      {
        role: "assistant",
        content: TUTORIAL_MESSAGE,
      },
    ]);
  }, [messages.length, setMessages]);

  async function sendMessage() {
    const userInput = input.trim();

    if (!userInput || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: userInput,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages([...updatedMessages, { role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    let fullText = "";
    let buffer = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          currentRoom,
          inventory,
          sceneState,
          gameState,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(await response.text());
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      function processLine(line: string) {
        if (!line.startsWith("data: ")) return;

        const raw = line.slice(6).trim();
        if (!raw) return;

        try {
          const data = JSON.parse(raw) as StreamEvent;

          if (data.type === "text" && data.content) {
            fullText += data.content;

            setMessages([
              ...updatedMessages,
              {
                role: "assistant",
                content: fullText,
              },
            ]);
          }

          if (data.type === "state") {
            if (data.currentRoom && isRoom(data.currentRoom)) {
              onRoomChange(data.currentRoom);
            }

            if (Array.isArray(data.inventory)) {
              onInventoryChange(data.inventory);
            }

            if (data.sceneState) {
              onSceneStateChange(data.sceneState);
            }

            if (data.gameState) {
              onGameStateChange(data.gameState);
            }
          }

          if (data.type === "error") {
            setMessages([
              ...updatedMessages,
              {
                role: "assistant",
                content:
                  data.message ||
                  "BASE para CAMPO. Falha na transmissão. Repita a ação. Câmbio.",
              },
            ]);
          }
        } catch {
          // Ignora linhas inválidas.
        }
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          processLine(line);
        }
      }

      if (buffer.trim()) {
        processLine(buffer);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "BASE para CAMPO. Perdi o sinal por alguns segundos. Tente novamente. Câmbio.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="radio-chat">
      <RadioHeader />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        bottomRef={bottomRef}
      />

      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={sendMessage}
      />
    </div>
  );
}