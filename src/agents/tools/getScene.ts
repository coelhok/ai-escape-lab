import { tool } from "ai";
import { z } from "zod";

const rooms: Record<string, string> = {
  lab: `
Você está em um laboratório abandonado.

Luzes piscam no teto.
Há uma mesa metálica cheia de papéis queimados.
Um computador antigo emite um som baixo.
Uma porta trancada possui um teclado numérico.
  `,

  corridor: `
Você está em um corredor estreito e mal iluminado.

As paredes têm marcas de queimadura.
Há portas metálicas dos dois lados.
Um som distante ecoa no fundo do corredor.
  `,

  server_room: `
Você entrou na sala dos servidores.

Racks piscam em vermelho.
O ar está frio e há cabos espalhados pelo chão.
Um terminal bloqueado aguarda uma senha.
  `,

  exit: `
Você chegou à saída de emergência.

A porta está reforçada.
Um painel exige a confirmação final para liberar a passagem.
  `,
};
export const getScene = tool({
  description: "Retorna a descrição da sala atual.",

  inputSchema: z.object({
    roomId: z.string(),
  }),

  execute: async ({
    roomId,
  }: {
    roomId: string;
  }) => {
    return {
      roomId,
      description:
        rooms[roomId] || "Sala desconhecida.",
    };
  },
});