import type { Message, Room, RoomInfo } from '@/types/game'

export const ROOMS: Record<Room, RoomInfo> = {
  lab: {
    emoji: '🔬',
    name: 'Laboratório',
    description:
      'Um laboratório escuro e abandonado. Equipamentos quebrados espalhados pelo chão. Uma porta de metal ao norte e uma janela gradeada ao leste.',
  },
  corridor: {
    emoji: '🚪',
    name: 'Corredor',
    description:
      'Um corredor longo e mal iluminado. O cheiro de ozônio no ar. Portas numeradas dos dois lados.',
  },
  server_room: {
    emoji: '🖥️',
    name: 'Sala de Servidores',
    description:
      'Servidores zumbindo. Luzes piscando em vermelho. Um terminal desbloqueado no canto.',
  },
  exit: {
    emoji: '🚨',
    name: 'Saída',
    description:
      'A saída! Uma porta reforçada com um painel de código numérico. Você está quase lá!',
  },
}

export const INITIAL_ROOM: Room = 'lab'

export const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content:
      'BASE para CAMPO. Agente, você está no laboratório. Equipamentos quebrados por toda parte. Consigo ver uma porta de metal ao norte. O que você vê aí? Câmbio.',
  },
]

export function isRoom(value: string): value is Room {
  return value in ROOMS
}
