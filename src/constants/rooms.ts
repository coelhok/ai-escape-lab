
import type { Room, RoomInfo } from "@/types/game";

export const INITIAL_ROOM: Room = "lab";


export const ROOMS: Record<Room, RoomInfo> = {
  lab: {
    id: "lab",
    emoji: "🔬",
    name: "Laboratório",
    description:
      "Um laboratório abandonado com luzes piscando, papéis queimados e uma porta trancada com teclado numérico.",
    imageUrl: "/rooms/lab.png",
    objects: ["computador antigo", "mesa metálica", "teclado numérico"],
  },

  corridor: {
    id: "corridor",
    emoji: "🚪",
    name: "Corredor",
    description:
      "Um corredor estreito e escuro, com portas metálicas e marcas de queimadura nas paredes.",
    imageUrl: "/rooms/corridor.png",
    objects: ["porta metálica", "lâmpada quebrada", "placa de emergência"],
  },

  server_room: {
    id: "server_room",
    emoji: "🖥️",
    name: "Sala dos Servidores",
    description:
      "Uma sala fria cheia de servidores piscando em vermelho e cabos espalhados pelo chão.",
    imageUrl: "/rooms/server_room.png",
    objects: ["rack de servidor", "terminal bloqueado", "cabo solto"],
  },

  exit: {
    id: "exit",
    emoji: "🚨",
    name: "Saída",
    description:
      "A saída de emergência está próxima, mas um painel de segurança ainda bloqueia a passagem.",
    imageUrl: "/rooms/exit.png",
    objects: ["porta de emergência", "painel final", "alarme"],
  },
};

export const ROOM_ORDER: Room[] = ["lab", "corridor", "server_room", "exit"];

export function isRoom(value: string): value is Room {
  return value in ROOMS;
}