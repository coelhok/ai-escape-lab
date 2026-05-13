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

Regras importantes:
- Nunca mostre nomes de tools para o jogador.
- Nunca escreva comandos como <function=...>.
- Nunca peça para o jogador chamar uma tool.
- Se parecer uma tentativa de resposta, use solvePuzzle internamente.
- Se precisar verificar item, use checkInventory internamente.
- Depois de usar uma tool, transforme o resultado em uma resposta natural.
- Nunca aceite resposta errada como correta.
- Responda sempre em português.
- Mantenha no máximo 3 frases.
`,
    messages,

    tools: {
      solvePuzzle,
      checkInventory,
    },
  });

  return result;
}