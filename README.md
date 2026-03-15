# 🔐 AI Escape Lab

Jogo de escape room com agentes de IA integrados. O jogador explora salas, 
coleta itens e resolve puzzles interagindo com um narrador inteligente powered 
by Claude (Anthropic).

Projeto desenvolvido para a disciplina **Engenharia de Prompt e Aplicação em IA**  
— Universidade Braz Cubas, 8º Período CC / 4º ADS.

---

## 🎮 Sobre o projeto

O AI Escape Lab é uma aplicação web completa onde a IA é parte central da 
mecânica do jogo — não apenas um chatbot. O jogador digita ações em linguagem 
natural e dois agentes de IA respondem em tempo real:

- **Agente Narrador** — descreve o ambiente, interpreta ações e controla a narrativa
- **Agente Puzzle Engine** — valida respostas, consulta o banco de puzzles via RAG e gera dicas progressivas

---

## 🧠 Técnicas de IA implementadas

- **Tool Use / Function Calling** — agentes chamam ferramentas externas (`change_room`, `check_inventory`, `solve_puzzle`)
- **RAG (Retrieval-Augmented Generation)** — busca vetorial em banco de puzzles via Supabase pgvector
- **Multi-agent** — orquestrador LangChain coordena dois agentes com papéis distintos
- **Memória persistente** — contexto de conversa e progresso salvos entre sessões

---

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| Autenticação | NextAuth.js v5 |
| Agentes | LangChain.js |
| Modelo de IA | Claude (Anthropic) |
| Banco de dados | Supabase (PostgreSQL + pgvector) |
| Deploy | Vercel |

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Chave de API da [Anthropic](https://console.anthropic.com)

### Instalação
```bash
