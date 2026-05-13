import { tool } from "ai";
import { z } from "zod";

const rooms: Record<string, string> = {
  laboratory: `
Você está em um laboratório abandonado.

Luzes piscam no teto.
Há uma mesa metálica cheia de papéis queimados.
Um computador antigo emite um som baixo.
Uma porta trancada possui um teclado numérico.
  `,

  control_room: `
Você entrou na sala de controle.

Monitores antigos mostram câmeras de segurança.
Há um painel elétrico aberto.
Cabos espalhados pelo chão soltam faíscas.
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