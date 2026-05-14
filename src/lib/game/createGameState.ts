export type GameState = {
  story: {
    title: string;
    objective: string;
    timeLimit: number;
  };
  puzzles: {
    lab_door: {
      room: "lab";
      type: "code";
      answer: string;
      clueItem: string;
      clueText: string;
      solved: boolean;
      unlocks: "corridor";
    };
    reactor_shutdown: {
      room: "server_room";
      type: "action";
      answer: string;
      clueItem: string;
      clueText: string;
      solved: boolean;
      unlocks: "exit";
    };
  };
  flags: {
    labDoorUnlocked: boolean;
    reactorDisabled: boolean;
    escaped: boolean;
    gameOver: boolean;
  };
};

const LAB_CODES = ["3142", "8542", "6291", "4738", "1907"];

export function createGameState(): GameState {
  const code = LAB_CODES[Math.floor(Math.random() * LAB_CODES.length)];

  return {
    story: {
      title: "Colapso no Laboratório Subterrâneo",
      objective:
        "Desligar o reator ou escapar antes que o laboratório entre em colapso.",
      timeLimit: 600,
    },
    puzzles: {
      lab_door: {
        room: "lab",
        type: "code",
        answer: code,
        clueItem: "anotação rasgada",
        clueText: `A anotação mostra quatro números quase apagados pela fuligem: ${code
          .split("")
          .join(", ")}.`,
        solved: false,
        unlocks: "corridor",
      },
      reactor_shutdown: {
        room: "server_room",
        type: "action",
        answer: "desligar reator",
        clueItem: "manual do reator",
        clueText:
          "O manual indica que o terminal principal controla o desligamento de emergência.",
        solved: false,
        unlocks: "exit",
      },
    },
    flags: {
      labDoorUnlocked: false,
      reactorDisabled: false,
      escaped: false,
      gameOver: false,
    },
  };
}