import { narratorAgent } from "./narrator";
import { puzzleEngineAgent } from "./puzzleEngine";

type AgentMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function shouldUsePuzzleEngine(message: string) {
  const text = message.toLowerCase();

  const puzzleKeywords = [
    "senha",
    "código",
    "codigo",
    "puzzle",
    "enigma",
    "resolver",
    "resposta",
    "tentar",
    "porta",
    "painel",
    "teclado",
    "dica",
  ];

  return puzzleKeywords.some((keyword) => text.includes(keyword));
}

export async function agentOrchestrator(messages: AgentMessage[]) {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  const content = lastUserMessage?.content ?? "";

  if (shouldUsePuzzleEngine(content)) {
    return puzzleEngineAgent(messages);
  }

  return narratorAgent(messages);
}