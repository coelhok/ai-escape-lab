import { tool } from "ai";
import { z } from "zod";

export const checkInventory = tool({
  description: "Verifica se o jogador possui um item no inventário.",

  inputSchema: z.object({
    item: z.string(),
    inventory: z.array(z.string()).optional(),
  }),

  execute: async ({
    item,
    inventory = [],
  }: {
    item: string;
    inventory?: string[];
  }) => {
    const hasItem = inventory
      .map((i) => i.toLowerCase())
      .includes(item.toLowerCase());

    return {
      item,
      hasItem,
      message: hasItem
        ? `O jogador possui o item: ${item}.`
        : `O jogador não possui o item: ${item}.`,
    };
  },
});