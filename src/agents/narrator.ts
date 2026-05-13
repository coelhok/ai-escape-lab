import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

import { getScene } from "./tools/getScene";
import { changeRoom } from "./tools/changeRoom";

type AgentMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function narratorAgent(messages: AgentMessage[]) {
  const result = streamText({
    model: groq("llama-3.1-8b-instant"),

    system: `
Você é o narrador principal de um jogo escape room com IA.

Seu papel:
- descrever ambientes
- criar tensão
- orientar o jogador
- interpretar ações em linguagem natural
- nunca revelar respostas diretamente
- incentivar exploração

Regras importantes:
- Nunca mostre nomes de tools para o jogador.
- Nunca escreva comandos como <function=...>.
- Nunca peça para o jogador chamar uma tool.
- Se precisar consultar a sala, use getScene internamente.
- Se precisar mudar de sala, use changeRoom internamente.
- Depois de usar uma tool, transforme o resultado em uma resposta narrativa natural.
- Responda sempre em português.
- Mantenha no máximo 3 frases.
    `,

    messages,

    tools: {
      getScene,
      changeRoom,
    },
  });

  return result;
}