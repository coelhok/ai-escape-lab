import { NextRequest } from "next/server";
import { narratorAgent } from "@/agents/narrator";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(req: NextRequest) {
  console.log("🚀 [1] Rota /api/chat chamada");

  try {
    const body = await req.json();

    const {
      messages,
      currentRoom = "laboratory",
      inventory = [],
    }: {
      messages: ChatMessage[];
      currentRoom?: string;
      inventory?: string[];
    } = body;

    const finalMessages: ChatMessage[] = [
      {
        role: "system",
        content: `
Contexto atual do jogo:
- Sala atual: ${currentRoom}
- Inventário: ${inventory.join(", ") || "vazio"}
        `,
      },
      ...messages,
    ];

    const result = await narratorAgent(finalMessages);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const textPart of result.textStream) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "text",
                  content: textPart,
                })}\n\n`
              )
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done" })}\n\n`
            )
          );
        } catch (error) {
          console.error("❌ [ERRO no stream]:", error);

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
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("❌ [ERRO interno /api/chat]:", error);

    return Response.json(
      { error: "Erro interno ao processar o chat." },
      { status: 500 }
    );
  }
}