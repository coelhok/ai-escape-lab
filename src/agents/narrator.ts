import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

import { getScene } from "./tools/getScene";
import { changeRoom } from "./tools/changeRoom";

export async function narratorAgent(messages: any[]) {
  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),

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
    `,

    messages,

    tools: {
      getScene,
      changeRoom,
    },

    
  });

  return result;
}