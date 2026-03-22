import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt do Agente Narrador
const NARRATOR_SYSTEM = `Você é o Agente Narrador do AI Escape Lab — um jogo de escape room.
Seu papel é descrever o ambiente, interpretar as ações do jogador e conduzir a narrativa.

Regras:
- Responda SEMPRE em português do Brasil
- Descreva o ambiente de forma imersiva e detalhada
- Interprete as ações do jogador de forma criativa
- Quando o jogador tentar pegar um item, use a tool check_inventory
- Quando o jogador quiser mudar de sala, use a tool change_room
- Mantenha o suspense e a imersão do jogo
- Respostas curtas e dinâmicas (máximo 3 parágrafos)`;

// Definição das tools (Function Calling - RF07)
const TOOLS: Anthropic.Tool[] = [
  {
    name: "change_room",
    description: "Muda o jogador para outra sala do escape room",
    input_schema: {
      type: "object" as const,
      properties: {
        room_id: {
          type: "string",
          description: "ID da sala destino (lab, corridor, server_room, exit)",
        },
        reason: {
          type: "string",
          description: "Motivo narrativo da mudança de sala",
        },
      },
      required: ["room_id", "reason"],
    },
  },
  {
    name: "check_inventory",
    description: "Verifica ou atualiza o inventário do jogador",
    input_schema: {
      type: "object" as const,
      properties: {
        action: {
          type: "string",
          enum: ["add", "remove", "list"],
          description: "Ação a realizar no inventário",
        },
        item: {
          type: "string",
          description: "Nome do item (obrigatório para add/remove)",
        },
      },
      required: ["action"],
    },
  },
  {
    name: "get_scene",
    description: "Retorna a descrição detalhada da cena/sala atual",
    input_schema: {
      type: "object" as const,
      properties: {
        room_id: {
          type: "string",
          description: "ID da sala para descrever",
        },
      },
      required: ["room_id"],
    },
  },
];

// Simulação das tools (depois vai conectar ao Supabase)
function executeTool(toolName: string, toolInput: Record<string, string>) {
  switch (toolName) {
    case "change_room":
      return {
        success: true,
        new_room: toolInput.room_id,
        message: `Você entrou em: ${toolInput.room_id}`,
      };

    case "check_inventory":
      if (toolInput.action === "list") {
        return { items: ["lanterna", "cartão magnético"] };
      }
      return { success: true, action: toolInput.action, item: toolInput.item };

    case "get_scene":
      const scenes: Record<string, string> = {
        lab: "Um laboratório escuro. Equipamentos quebrados espalhados pelo chão. Uma porta de metal ao norte e uma janela gradeada ao leste.",
        corridor: "Um corredor longo e mal iluminado. O cheiro de ozônio no ar. Portas numeradas dos dois lados.",
        server_room: "Uma sala de servidores zumbindo. Luzes piscando em vermelho. Um terminal desbloqueado no canto.",
        exit: "A saída! Uma porta reforçada com um painel de código numérico.",
      };
      return {
        description: scenes[toolInput.room_id] || "Sala desconhecida.",
      };

    default:
      return { error: "Tool não encontrada" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, currentRoom = "lab", inventory = [] } = await req.json();

    // Contexto de estado do jogo injetado no system prompt
    const systemWithContext = `${NARRATOR_SYSTEM}

ESTADO ATUAL DO JOGO:
- Sala atual: ${currentRoom}
- Inventário do jogador: ${inventory.length > 0 ? inventory.join(", ") : "vazio"}`;

    // Stream SSE para o frontend (RF05)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let currentMessages = [...messages];

          // Loop agentico: continua até não ter mais tool calls
          while (true) {
            const response = await client.messages.create({
              model: "claude-sonnet-4-5",
              max_tokens: 1024,
              system: systemWithContext,
              tools: TOOLS,
              messages: currentMessages,
              stream: true,
            });

            let fullText = "";
            let toolUseBlock: Anthropic.ToolUseBlock | null = null;
            let stopReason = "";

            // Processa o stream token a token
            for await (const event of response) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                fullText += event.delta.text;
                // Envia cada token para o frontend em tempo real
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "text", content: event.delta.text })}\n\n`
                  )
                );
              }

              if (event.type === "content_block_start" && event.content_block.type === "tool_use") {
                toolUseBlock = event.content_block as Anthropic.ToolUseBlock;
              }

              if (event.type === "message_delta") {
                stopReason = event.delta.stop_reason ?? "";
              }
            }

            // Se parou por tool_use, executa a tool e continua o loop
            if (stopReason === "tool_use" && toolUseBlock) {
              const toolResult = executeTool(
                toolUseBlock.name,
                toolUseBlock.input as Record<string, string>
              );

              // Notifica o frontend que uma tool foi chamada
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "tool_call",
                    tool: toolUseBlock.name,
                    result: toolResult,
                  })}\n\n`
                )
              );

              // Adiciona o resultado da tool no histórico e continua
              currentMessages = [
                ...currentMessages,
                { role: "assistant", content: [toolUseBlock] },
                {
                  role: "user",
                  content: [
                    {
                      type: "tool_result",
                      tool_use_id: toolUseBlock.id,
                      content: JSON.stringify(toolResult),
                    },
                  ],
                },
              ];
            } else {
              // Sem tool_use: resposta final, encerra o stream
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "done", fullText })}\n\n`
                )
              );
              break;
            }
          }
       } catch (error) {
  console.log('❌ Erro no agente:', error)
  controller.enqueue(
    encoder.encode(
      `data: ${JSON.stringify({ type: "error", message: String(error) })}\n\n`
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
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}