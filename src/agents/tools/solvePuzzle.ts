import { tool } from "ai";
import { z } from "zod";

const puzzles: Record<string, { answer: string; reward?: string }> = {
  lab_door_code: {
    answer: "3142",
    reward: "porta do laboratório destrancada",
  },
  control_panel: {
    answer: "reiniciar sistema",
    reward: "painel de controle ativado",
  },
};

export async function validatePuzzle({
  puzzleId,
  answer,
}: {
  puzzleId: string;
  answer: string;
}) {
  const puzzle = puzzles[puzzleId];

  if (!puzzle) {
    return {
      success: false,
      message: "Puzzle não encontrado.",
    };
  }

  const isCorrect =
    answer.trim().toLowerCase() === puzzle.answer.toLowerCase();

  return {
    success: isCorrect,
    puzzleId,
    reward: isCorrect ? puzzle.reward : null,
    message: isCorrect
      ? "Resposta correta. O puzzle foi resolvido."
      : "Resposta incorreta. Ofereça uma dica progressiva ao jogador.",
  };
}

export const solvePuzzle = tool({
  description: "Valida a resposta de um puzzle do escape room.",

  inputSchema: z.object({
    puzzleId: z.string(),
    answer: z.string(),
  }),

  execute: validatePuzzle,
});