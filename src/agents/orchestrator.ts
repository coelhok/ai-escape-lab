import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

import type { GameState } from "@/lib/game/createGameState";

type AgentMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type Room = "lab" | "corridor" | "server_room" | "exit";

type StateUpdate = {
  currentRoom?: Room;
  inventory?: string[];
  sceneState?: string;
  gameState?: GameState;
};

const MODEL = groq("llama-3.1-8b-instant");

const ROOM_PATHS: Record<Room, Room[]> = {
  lab: ["corridor"],
  corridor: ["lab", "server_room"],
  server_room: ["corridor", "exit"],
  exit: ["server_room"],
};

function normalizeRoom(value?: string): Room {
  if (value === "laboratory") return "lab";

  if (
    value === "lab" ||
    value === "corridor" ||
    value === "server_room" ||
    value === "exit"
  ) {
    return value;
  }

  return "lab";
}

function getLastUserMessage(messages: AgentMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user");
}

function detectTargetRoom(message: string): Room | null {
  const text = message.toLowerCase();

  if (text.includes("corredor")) return "corridor";

  if (text.includes("servidor") || text.includes("servidores")) {
    return "server_room";
  }

  if (text.includes("saída") || text.includes("saida")) return "exit";

  if (text.includes("laboratório") || text.includes("laboratorio")) {
    return "lab";
  }

  return null;
}

function isMovementIntent(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("ir") ||
    text.includes("entrar") ||
    text.includes("seguir") ||
    text.includes("avançar") ||
    text.includes("avancar") ||
    text.includes("voltar")
  );
}

function isExitIntentWithoutRoomContext(message: string) {
  const text = message.toLowerCase();

  return (
    text === "sair" ||
    text.includes("quero sair") ||
    text.includes("escapar") ||
    text.includes("fugir")
  );
}

function isInventoryIntent(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("inventário") ||
    text.includes("inventario") ||
    text.includes("mochila") ||
    text.includes("itens")
  );
}

function isHelpIntent(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("ajuda") ||
    text.includes("tutorial") ||
    text.includes("como jogar") ||
    text.includes("o que faço") ||
    text.includes("o que eu faço") ||
    text.includes("comandos")
  );
}

function isDescribeRoomIntent(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("descreva") ||
    text.includes("descrever") ||
    text.includes("olhar sala") ||
    text.includes("ver sala") ||
    text.includes("examinar sala") ||
    text.includes("o que tem") ||
    text.includes("onde estou")
  );
}

function isExamineIntent(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("examinar") ||
    text.includes("olhar") ||
    text.includes("investigar") ||
    text.includes("vasculhar") ||
    text.includes("ler")
  );
}

function isPuzzleIntent(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("senha") ||
    text.includes("código") ||
    text.includes("codigo") ||
    text.includes("teclado") ||
    text.includes("painel") ||
    text.includes("porta") ||
    /\d{3,6}/.test(text)
  );
}

function isReactorIntent(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("desligar reator") ||
    text.includes("desativar reator") ||
    text.includes("parar reator") ||
    text.includes("shutdown") ||
    text.includes("desligar o reator") ||
    text.includes("desativar o reator")
  );
}

function extractPuzzleAnswer(message: string) {
  const match = message.match(/\d{3,6}/);
  return match?.[0] ?? "";
}

function addUniqueItem(inventory: string[], item: string) {
  const exists = inventory.some(
    (value) => value.toLowerCase() === item.toLowerCase()
  );

  if (exists) return inventory;

  return [...inventory, item];
}

function filterVisibleInventory(inventory: string[]) {
  return inventory.filter((item) => !item.startsWith("__"));
}

function getRoomDescription(room: Room, gameState: GameState) {
  const labDoorStatus = gameState.flags.labDoorUnlocked
    ? "A porta metálica do laboratório está destrancada."
    : "A porta metálica do laboratório está trancada por um teclado numérico.";

  const reactorStatus = gameState.flags.reactorDisabled
    ? "O reator foi estabilizado."
    : "O reator continua instável e ameaça entrar em colapso.";

  const descriptions: Record<Room, unknown> = {
    lab: {
      success: true,
      action: "describe_room",
      room: "lab",
      description:
        "O laboratório está frio, com equipamentos quebrados, uma mesa metálica, um computador antigo e papéis queimados espalhados pelo chão.",
      visibleObjects: [
        "computador antigo",
        "mesa metálica",
        "papéis queimados",
        "teclado numérico",
        "porta metálica",
      ],
      status: labDoorStatus,
    },

    corridor: {
      success: true,
      action: "describe_room",
      room: "corridor",
      description:
        "O corredor é estreito, escuro e marcado por luzes de emergência piscando nas paredes.",
      visibleObjects: ["portas metálicas", "placa de emergência", "luzes piscando"],
      status: "O caminho liga o laboratório à sala dos servidores.",
    },

    server_room: {
      success: true,
      action: "describe_room",
      room: "server_room",
      description:
        "A sala dos servidores vibra com calor e ruído elétrico. Racks piscam em vermelho ao redor do terminal principal.",
      visibleObjects: ["terminal principal", "racks de servidor", "painel do reator"],
      status: reactorStatus,
    },

    exit: {
      success: true,
      action: "describe_room",
      room: "exit",
      description:
        "A saída de emergência fica à frente, protegida por um painel de segurança.",
      visibleObjects: ["porta de emergência", "painel final"],
      status: gameState.flags.reactorDisabled
        ? "O painel indica rota liberada."
        : "O painel ainda bloqueia a saída por causa do reator ativo.",
    },
  };

  return descriptions[room];
}

function createResponse(
  messages: AgentMessage[],
  ruleResult: unknown,
  stateUpdate: StateUpdate | null = null
) {
  const stream = streamText({
    model: MODEL,
    system: `
Você é BASE, operador tático do AI Escape Lab.

Você recebeu um resultado interno da lógica do jogo.
Sua função é transformar APENAS esse resultado em narrativa curta.

A lógica interna é a verdade absoluta.
Não crie fatos fora dela.

REGRAS CRÍTICAS:
- Nunca invente números, códigos, senhas, sequências, puzzles, salas, objetos, itens, portas ou eventos.
- Nunca mencione nada que não esteja no resultado interno.
- Se o resultado não contiver números, não mencione números.
- Se houver clue, você pode narrar a pista exatamente, sem explicar a solução.
- Nunca revele solução se o jogador errou.
- Nunca diga explicitamente "use o comando", "digite", "tente senha" ou "o próximo passo é".
- Nunca fale como sistema.
- Nunca mostre JSON, código, tools ou detalhes técnicos.
- Nunca contradiga success, message, item, clue, status ou visibleObjects.
- Se action for "collect_item", diga que o item foi encontrado e foi guardado.
- Se action for "show_inventory", liste apenas os itens recebidos.
- Se action for "move_room" com success false, deixe claro que o avanço foi bloqueado.
- Se action for "solve_puzzle" com success true, narre o efeito de destravamento.
- Se action for "reactor_shutdown" com success true, narre a estabilização do reator.
- Responda em português.
- Use no máximo 3 frases.
- Termine com "Câmbio."
    `,
    messages: [
      ...messages,
      {
        role: "system",
        content: `Resultado interno da lógica do jogo: ${JSON.stringify(
          ruleResult
        )}`,
      },
    ],
  });

  return {
    stream,
    stateUpdate,
  };
}

export async function agentOrchestrator(
  messages: AgentMessage[],
  currentRoomInput?: string,
  inventoryInput: string[] = [],
  sceneStateInput = "lab_locked",
  gameStateInput?: GameState | null
) {
  const lastUserMessage = getLastUserMessage(messages);
  const content = lastUserMessage?.content ?? "";

  const currentRoom = normalizeRoom(currentRoomInput);
  const inventory = inventoryInput || [];
  const gameState = gameStateInput;

  if (!gameState) {
    return createResponse(messages, {
      success: false,
      action: "missing_game_state",
      reason:
        "O estado do jogo não foi carregado. Inicie uma nova sessão para reconstruir a missão.",
    });
  }

  if (gameState.flags.gameOver) {
    return createResponse(messages, {
      success: false,
      action: "game_over",
      reason:
        "A missão já foi encerrada. Não há mais ações disponíveis nesta sessão.",
    });
  }

  if (isHelpIntent(content)) {
    return createResponse(messages, {
      success: true,
      action: "help",
      objective: gameState.story.objective,
      currentRoom,
      availableRooms: ROOM_PATHS[currentRoom],
      message:
        "Oriente o jogador de forma imersiva a observar a sala, examinar objetos e seguir pistas, sem entregar soluções.",
    });
  }

  if (isInventoryIntent(content)) {
    const visibleInventory = filterVisibleInventory(inventory);

    return createResponse(messages, {
      success: true,
      action: "show_inventory",
      inventory: visibleInventory,
      message:
        visibleInventory.length > 0
          ? `Inventário atual: ${visibleInventory.join(", ")}.`
          : "Inventário vazio.",
    });
  }

  if (isDescribeRoomIntent(content)) {
    return createResponse(messages, getRoomDescription(currentRoom, gameState));
  }

  if (isExitIntentWithoutRoomContext(content)) {
    return createResponse(messages, {
      success: false,
      action: "escape_attempt",
      currentRoom,
      reason:
        "O jogador não pode escapar diretamente. A saída depende da estabilização do reator.",
      reactorDisabled: gameState.flags.reactorDisabled,
    });
  }

  if (isExamineIntent(content)) {
    const text = content.toLowerCase();

    if (currentRoom === "lab" && text.includes("computador")) {
      const puzzle = gameState.puzzles.lab_door;
      const item = puzzle.clueItem;
      const nextInventory = addUniqueItem(inventory, item);

      return createResponse(
        messages,
        {
          success: true,
          action: "collect_item",
          item,
          clue: puzzle.clueText,
          message:
            "Uma anotação parcialmente destruída estava escondida sob o teclado do computador antigo.",
        },
        {
          currentRoom,
          inventory: nextInventory,
          sceneState: sceneStateInput,
          gameState,
        }
      );
    }

    if (currentRoom === "lab" && text.includes("mesa")) {
      const item = "lanterna fraca";
      const nextInventory = addUniqueItem(inventory, item);

      return createResponse(
        messages,
        {
          success: true,
          action: "collect_item",
          item,
          message:
            "Uma lanterna enferrujada foi encontrada dentro da gaveta metálica.",
        },
        {
          currentRoom,
          inventory: nextInventory,
          sceneState: sceneStateInput,
          gameState,
        }
      );
    }

    if (currentRoom === "server_room" && text.includes("terminal")) {
      const puzzle = gameState.puzzles.reactor_shutdown;
      const item = puzzle.clueItem;
      const nextInventory = addUniqueItem(inventory, item);

      return createResponse(
        messages,
        {
          success: true,
          action: "collect_item",
          item,
          clue: puzzle.clueText,
          message:
            "O terminal principal exibe instruções de emergência sobre o reator.",
        },
        {
          currentRoom,
          inventory: nextInventory,
          sceneState: sceneStateInput,
          gameState,
        }
      );
    }

    return createResponse(messages, {
      success: false,
      action: "examine",
      currentRoom,
      reason:
        "Nada útil foi encontrado nessa ação. Apenas objetos visíveis da sala podem revelar pistas.",
      roomInfo: getRoomDescription(currentRoom, gameState),
    });
  }

  const targetRoom = detectTargetRoom(content);

  if (targetRoom && isMovementIntent(content)) {
    const allowedRooms = ROOM_PATHS[currentRoom];

    if (!allowedRooms.includes(targetRoom)) {
      return createResponse(messages, {
        success: false,
        action: "move_room",
        currentRoom,
        targetRoom,
        reason: "Essa sala não é acessível a partir da sala atual.",
        availableRooms: allowedRooms,
      });
    }

    if (
      currentRoom === "lab" &&
      targetRoom === "corridor" &&
      !gameState.flags.labDoorUnlocked
    ) {
      return createResponse(messages, {
        success: false,
        action: "move_room",
        currentRoom,
        targetRoom,
        reason:
          "A porta do laboratório ainda está trancada pelo teclado numérico.",
      });
    }

    if (
      currentRoom === "server_room" &&
      targetRoom === "exit" &&
      !gameState.flags.reactorDisabled
    ) {
      return createResponse(messages, {
        success: false,
        action: "move_room",
        currentRoom,
        targetRoom,
        reason:
          "A saída continua bloqueada enquanto o reator estiver instável.",
      });
    }

    const nextSceneState =
      targetRoom === "lab"
        ? gameState.flags.labDoorUnlocked
          ? "lab_unlocked"
          : "lab_locked"
        : targetRoom === "server_room"
        ? gameState.flags.reactorDisabled
          ? "server_room_reactor_disabled"
          : "server_room_reactor_active"
        : targetRoom === "exit"
        ? "exit_open"
        : "corridor_dark";

    return createResponse(
      messages,
      {
        success: true,
        action: "move_room",
        previousRoom: currentRoom,
        newRoom: targetRoom,
      },
      {
        currentRoom: targetRoom,
        inventory,
        sceneState: nextSceneState,
        gameState,
      }
    );
  }

  if (isPuzzleIntent(content)) {
    if (currentRoom !== "lab") {
      return createResponse(messages, {
        success: false,
        action: "solve_puzzle",
        currentRoom,
        reason:
          "Esse teclado numérico pertence ao laboratório. Não há esse puzzle na sala atual.",
      });
    }

    const answer = extractPuzzleAnswer(content);

    if (!answer) {
      return createResponse(messages, {
        success: false,
        action: "solve_puzzle",
        reason:
          "O jogador tentou interagir com o teclado, mas não informou uma sequência numérica.",
      });
    }

    const puzzle = gameState.puzzles.lab_door;
    const isCorrect = answer === puzzle.answer;

    if (!isCorrect) {
      return createResponse(messages, {
        success: false,
        action: "solve_puzzle",
        answer,
        message:
          "A sequência falhou. A resposta deve ser buscada nas pistas do laboratório, sem revelar a solução.",
      });
    }

    const updatedGameState: GameState = {
      ...gameState,
      puzzles: {
        ...gameState.puzzles,
        lab_door: {
          ...gameState.puzzles.lab_door,
          solved: true,
        },
      },
      flags: {
        ...gameState.flags,
        labDoorUnlocked: true,
      },
    };

    return createResponse(
      messages,
      {
        success: true,
        action: "solve_puzzle",
        message:
          "A sequência foi aceita. A porta metálica do laboratório destrancou.",
      },
      {
        currentRoom,
        inventory,
        sceneState: "lab_unlocked",
        gameState: updatedGameState,
      }
    );
  }

  if (isReactorIntent(content)) {
    if (currentRoom !== "server_room") {
      return createResponse(messages, {
        success: false,
        action: "reactor_shutdown",
        reason: "O reator só pode ser estabilizado na sala dos servidores.",
      });
    }

    const updatedGameState: GameState = {
      ...gameState,
      puzzles: {
        ...gameState.puzzles,
        reactor_shutdown: {
          ...gameState.puzzles.reactor_shutdown,
          solved: true,
        },
      },
      flags: {
        ...gameState.flags,
        reactorDisabled: true,
      },
    };

    return createResponse(
      messages,
      {
        success: true,
        action: "reactor_shutdown",
        message:
          "O terminal aceitou o comando de emergência. O reator começou a estabilizar.",
      },
      {
        currentRoom,
        inventory,
        sceneState: "server_room_reactor_disabled",
        gameState: updatedGameState,
      }
    );
  }

  return createResponse(messages, {
    success: true,
    action: "free_observation",
    currentRoom,
    roomInfo: getRoomDescription(currentRoom, gameState),
    instruction:
      "Narre apenas com base na sala atual, nos objetos oficiais e no estado salvo do jogo.",
  });
}