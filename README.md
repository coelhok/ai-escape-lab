# 🔐 AI Escape Lab

Escape room inteligente com arquitetura multi-agente baseada em IA generativa.

O jogador explora ambientes, resolve puzzles e interage em linguagem natural com agentes de IA especializados que controlam a narrativa e a lógica do jogo em tempo real.

Projeto desenvolvido para a disciplina **Engenharia de Prompt e Aplicações em IA**  
— Universidade Braz Cubas (ADS / Ciência da Computação)

---

# 🎮 Sobre o projeto

O AI Escape Lab transforma a IA no núcleo da mecânica do jogo.

Em vez de menus fixos ou comandos pré-programados, o jogador interage usando linguagem natural. Um sistema multi-agente interpreta ações, controla o ambiente e responde dinamicamente conforme o progresso da sessão.

A aplicação funciona como um escape room narrativo orientado por IA, combinando:

- narrativa procedural
- resolução de puzzles
- memória contextual
- tool calling
- streaming em tempo real

---

# 🧠 Arquitetura de IA

O sistema utiliza uma arquitetura multi-agente modular.

## 🎙️ Narrator Agent

Responsável por:

- descrever ambientes
- interpretar ações do jogador
- controlar tensão narrativa
- orientar exploração
- movimentação entre salas

### Tools utilizadas

- `getScene`
- `changeRoom`

---

## 🧩 Puzzle Engine Agent

Responsável por:

- validar respostas de puzzles
- gerar dicas progressivas
- controlar progressão lógica
- verificar itens do inventário

### Tools utilizadas

- `solvePuzzle`
- `checkInventory`

---

## 🧭 Agent Orchestrator

Camada responsável por coordenar os agentes.

O orquestrador analisa a intenção da mensagem do jogador e decide qual agente deve responder:

- Narrador
- Puzzle Engine

---

# ⚙️ Técnicas de IA implementadas

## ✅ Tool Calling

Os agentes utilizam ferramentas internas para executar ações estruturadas:

- troca de salas
- validação de puzzles
- verificação de inventário
- leitura de contexto

---

## ✅ Streaming SSE

As respostas são transmitidas em tempo real usando:

- Server-Sent Events (SSE)
- AI SDK streaming
- resposta token-by-token

---

## ✅ Multi-Agent Architecture

O sistema separa responsabilidades entre agentes especializados:

- narrativa
- puzzles
- orquestração

Isso melhora:

- modularidade
- escalabilidade
- controle de prompts
- consistência das respostas

---

## 🚧 Próximas evoluções

Estruturas planejadas para próximas versões:

- RAG com pgvector
- memória persistente avançada
- geração procedural de puzzles
- supervisor agent
- salvamento de progresso
- ranking de sessões

---

# 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 16 |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| IA | Groq |
| SDK de IA | Vercel AI SDK |
| Autenticação | NextAuth.js v5 |
| Banco de dados | Supabase |
| ORM/DB | PostgreSQL |
| Deploy | Vercel |

---

# 🚀 Como rodar localmente

## Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Chave da API Groq

---

## Instalação

```bash
git clone https://github.com/coelhok/ai-escape-lab.git

cd ai-escape-lab

npm install
