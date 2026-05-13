import { tool } from "ai";
import { z } from "zod";

const validRooms = [
  "laboratory",
  "control_room",
];

export const changeRoom = tool({
  description:
    "Move o jogador para outra sala.",

  inputSchema: z.object({
    roomId: z.string(),
  }),

  execute: async ({
    roomId,
  }: {
    roomId: string;
  }) => {
    if (!validRooms.includes(roomId)) {
      return {
        success: false,
        message: "Sala inválida.",
      };
    }

    return {
      success: true,
      currentRoom: roomId,
      message: `Jogador movido para ${roomId}.`,
    };
  },
});