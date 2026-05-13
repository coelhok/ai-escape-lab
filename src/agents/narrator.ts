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
- nunca revelar respostas diretamente
- incentivar exploração
- usar tools quando necessário

Se o jogador pedir descrição da sala:
use getScene.

Se o jogador quiser mudar de sala:
use changeRoom.

Depois de usar uma tool, sempre gere uma resposta final em texto para o jogador.
    `,

    messages,

    tools: {
      getScene,
      changeRoom,
    },
  });

  return result;
}