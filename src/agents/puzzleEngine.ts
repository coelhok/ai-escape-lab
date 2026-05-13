import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

import { solvePuzzle } from "./tools/solvePuzzle";
import { checkInventory } from "./tools/checkInventory";

type AgentMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function puzzleEngineAgent(messages: AgentMessage[]) {
  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),

    system: `
Você é o Puzzle Engine do AI Escape Lab.

Sua função:
- validar respostas de puzzles
- gerar dicas progressivas
- nunca entregar a resposta diretamente
- verificar inventário quando necessário
- manter justiça no desafio

Tools disponíveis:
- solvePuzzle: use para validar respostas de puzzles
- checkInventory: use para verificar itens necessários

Regras:
- Nunca aceite resposta errada como correta.
- Se o jogador errar, dê uma dica leve.
- Se parecer uma tentativa de resposta, use solvePuzzle.
- Responda sempre em português.
    `,

    messages,

    tools: {
      solvePuzzle,
      checkInventory,
    },
  });

  return result;
}