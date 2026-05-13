import type { Message, Room } from "@/types/game";

export type SavedGameSession = {
  id: string;
  currentRoom: Room;
  inventory: string[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

const HISTORY_KEY = "ai_escape_lab_history";
const CURRENT_KEY = "ai_escape_lab_current_session";

export function getHistory(): SavedGameSession[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as SavedGameSession[];
  } catch {
    return [];
  }
}

export function saveSession(session: SavedGameSession) {
  if (typeof window === "undefined") return;

  const history = getHistory();
  const withoutCurrent = history.filter((item) => item.id !== session.id);

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify([session, ...withoutCurrent].slice(0, 20))
  );
}

export function saveCurrentSession(session: SavedGameSession) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CURRENT_KEY, JSON.stringify(session));
  saveSession(session);
}

export function getCurrentSession(): SavedGameSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(CURRENT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SavedGameSession;
  } catch {
    return null;
  }
}

export function clearCurrentSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CURRENT_KEY);
}

export function loadSession(sessionId: string) {
  const session = getHistory().find((item) => item.id === sessionId);

  if (session) {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(session));
  }

  return session;
}