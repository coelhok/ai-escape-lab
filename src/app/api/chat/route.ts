import OpenAI from "openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log('🚀 [1] Rota /api/chat chamada')

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  console.log('✅ [2] Cliente Groq criado')

  try {
    const body = await req.json();
    console.log('✅ [3] Body recebido:', JSON.stringify(body).slice(0, 100))

    const { messages, currentRoom = "lab", inventory = [] } = body;
    console.log('✅ [4] Messages:', messages.length, 'mensagens')
    console.log('✅ [5] Última mensagem:', messages[messages.length - 1])

    const system = `Voce e BASE, agente de suporte tatico do AI Escape Lab.
Fale como operador de radio tatico.
Termine suas mensagens com Cambio.
Faca perguntas sobre o ambiente.
Maximo 3 frases por resposta.
Sala atual: ${currentRoom}.
Inventario: ${inventory.join(", ") || "vazio"}.`;

    console.log('✅ [6] System prompt criado')

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('✅ [7] Iniciando chamada ao Groq...')

          const response = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            stream: true,
            max_tokens: 1024,
            messages: [
              { role: "system", content: system },
              ...messages.map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
            ],
          });

          console.log('✅ [8] Groq respondeu, iniciando stream...')

          let totalText = '';
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              totalText += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`)
              );
            }
          }

          console.log('✅ [9] Stream completo. Total de texto:', totalText.length, 'chars')

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );

        } catch (error) {
          console.log("❌ [ERRO no stream]:", error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", message: String(error) })}\n\n`)
          );
        } finally {
          console.log('✅ [10] Stream fechado')
          controller.close();
        }
      },
    });

    console.log('✅ [11] Retornando Response com stream')
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

  } catch (error) {
    console.log("❌ [ERRO interno]:", error)
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}