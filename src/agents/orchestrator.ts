import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

import { narratorAgent } from "./narrator";
import { validatePuzzle } from "./tools/solvePuzzle";

type AgentMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function shouldUsePuzzleEngine(message: string) {
  const text = message.toLowerCase();

  const puzzleKeywords = [
    "senha",
    "código",
    "codigo",
    "puzzle",
    "enigma",
    "resolver",
    "resposta",
    "tentar",
    "porta",
    "painel",
    "teclado",
    "dica",
  ];

  return puzzleKeywords.some((keyword) => text.includes(keyword));
}

function extractPuzzleAnswer(message: string) {
  const match = message.match(/\d{3,6}/);
  return match?.[0] ?? message;
}

export async function agentOrchestrator(messages: AgentMessage[]) {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  const content = lastUserMessage?.content ?? "";

  if (!shouldUsePuzzleEngine(content)) {
    return narratorAgent(messages);
  }

  const answer = extractPuzzleAnswer(content);

 const toolResult = await validatePuzzle({
  puzzleId: "lab_door_code",
  answer,
    });

  return streamText({
    model: groq("llama-3.1-8b-instant"),

    system: `
Você é o Puzzle Engine narrativo do AI Escape Lab.

Você recebeu o resultado interno de uma validação de puzzle.

Regras:
- Nunca mostre nomes de tools.
- Nunca escreva <function=...>.
- Nunca explique detalhes técnicos.
- Transforme o resultado interno em uma resposta natural para o jogador.
- Se a resposta estiver correta, confirme de forma narrativa.
- Se estiver errada, dê uma dica leve sem revelar a solução.
- Responda sempre em português.
- Use no máximo 3 frases.
    `,

    messages: [
      ...messages,
      {
        role: "system",
        content: `Resultado interno da validação do puzzle: ${JSON.stringify(toolResult)}`,
      },
    ],
  });
}