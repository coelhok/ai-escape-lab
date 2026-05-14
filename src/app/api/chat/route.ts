import { NextRequest } from "next/server";
import { agentOrchestrator } from "@/agents/orchestrator";
import type { GameState } from "@/lib/game/createGameState";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatBody = {
  messages: ChatMessage[];
  currentRoom?: string;
  inventory?: string[];
  sceneState?: string;
  gameState?: GameState | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatBody;

    const {
      messages,
      currentRoom = "lab",
      inventory = [],
      sceneState = "lab_locked",
      gameState = null,
    } = body;

    const finalMessages: ChatMessage[] = [
      {
        role: "system",
        content: `
Estado atual do jogo:

Sala atual:
${currentRoom}

Estado visual:
${sceneState}

Inventário:
${inventory.join(", ") || "vazio"}

Game state:
${JSON.stringify(gameState, null, 2)}
        `,
      },
      ...messages,
    ];

    const result = await agentOrchestrator(
            finalMessages,
            currentRoom,
            inventory,
            sceneState,
            gameState
        ) 
    const textStream = result.stream.textStream;
    const stateUpdate = result.stateUpdate;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const textPart of textStream) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "text",
                  content: textPart,
                })}\n\n`
              )
            );
          }

          if (stateUpdate) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "state",
                  ...stateUpdate,
                })}\n\n`
              )
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
              })}\n\n`
            )
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: String(error),
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json(
      {
        error: "Erro interno ao processar o chat.",
      },
      {
        status: 500,
      }
    );
  }
}