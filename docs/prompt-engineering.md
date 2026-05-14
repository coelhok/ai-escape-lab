# 🧠 Prompt Engineering — AI Escape Lab

Documentação das estratégias de Prompt Engineering utilizadas no projeto AI Escape Lab.

---

# 🎯 Objetivo

Criar uma experiência de escape room baseada em linguagem natural, utilizando múltiplos agentes especializados para:

* narrativa dinâmica
* resolução de puzzles
* interpretação de ações do jogador
* progressão contextual
* tool calling

---

# 🧩 Arquitetura de prompts

O sistema utiliza prompts separados para cada agente:

| Agente         | Responsabilidade                    |
| -------------- | ----------------------------------- |
| Narrator Agent | Narrativa, exploração e ambientação |
| Puzzle Engine  | Validação de puzzles e dicas        |
| Orchestrator   | Direcionamento de mensagens         |

---

# 🎙️ Narrator Agent

## Objetivo

Responsável pela imersão narrativa e interpretação das ações do jogador.

---

## Prompt inicial

```txt
Você é um narrador de escape room.
Descreva os ambientes e responda o jogador.
```

---

## Problemas encontrados

* respostas muito genéricas
* pouca tensão narrativa
* revelava pistas cedo demais
* ignorava contexto da sala
* comportamento inconsistente

---

## Iteração 2

```txt
Você é o narrador principal de um jogo escape room com IA.

Seu papel:
- descrever ambientes
- criar tensão
- orientar o jogador
- nunca revelar respostas diretamente
- incentivar exploração
- usar tools quando necessário

Se o jogador pedir descrição da sala:
use getScene.

Se o jogador quiser mudar de sala:
use changeRoom.

Depois de usar uma tool, sempre gere uma resposta final em texto para o jogador.
```

---

## Melhorias obtidas

✅ respostas mais imersivas
✅ maior consistência narrativa
✅ melhor separação entre narrativa e puzzles
✅ incentivo à exploração
✅ redução de respostas genéricas

---

# 🧩 Puzzle Engine Agent

## Objetivo

Controlar puzzles e progressão lógica do jogo.

---

## Prompt inicial

```txt
Você valida puzzles do jogo.
```

---

## Problemas encontrados

* aceitava respostas erradas
* entregava soluções diretamente
* inconsistência nas dicas
* pouca progressão de dificuldade

---

## Iteração 2

```txt
Você é o Puzzle Engine do AI Escape Lab.

Sua função:
- validar respostas de puzzles
- gerar dicas progressivas
- nunca entregar a resposta diretamente
- verificar inventário quando necessário
- manter justiça no desafio

Tools disponíveis:
- solvePuzzle
- checkInventory

Regras:
- Nunca aceite resposta errada como correta.
- Se o jogador errar, dê uma dica leve.
- Se parecer uma tentativa de resposta, use solvePuzzle.
- Depois de usar uma tool, sempre gere uma resposta final em texto para o jogador.
```

---

## Melhorias obtidas

✅ validação mais consistente
✅ dicas progressivas
✅ melhor controle de dificuldade
✅ separação clara da lógica do jogo

---

# 🧭 Orchestrator

## Objetivo

Decidir qual agente deve responder.

---

## Estratégia atual

O orquestrador analisa palavras-chave da mensagem do jogador:

* puzzles
* códigos
* senhas
* dicas
* respostas
* teclado
* porta
* painel

Mensagens relacionadas a puzzles são encaminhadas ao Puzzle Engine.

Demais mensagens são enviadas ao Narrator Agent.

---

# 🔧 Tool Calling

O projeto implementa Tool Calling utilizando Vercel AI SDK.

---

## Tools implementadas

| Tool             | Função                    |
| ---------------- | ------------------------- |
| `getScene`       | Retorna descrição da sala |
| `changeRoom`     | Move jogador entre salas  |
| `solvePuzzle`    | Valida respostas          |
| `checkInventory` | Consulta inventário       |

---

# 💡 Exemplo de fluxo

## Entrada do jogador

```txt
A senha da porta é 3142?
```

---

## Fluxo interno

```txt
Frontend
↓
/api/chat
↓
Agent Orchestrator
↓
Puzzle Engine
↓
solvePuzzle()
↓
Resposta em streaming
```

---

# 🌊 Streaming

O sistema utiliza:

* Server-Sent Events (SSE)
* AI SDK Streaming
* Resposta token-by-token

Isso melhora:

* sensação de tempo real
* imersão
* experiência conversacional

---

# 🛠️ Tecnologias relacionadas à IA

| Tecnologia    | Uso                      |
| ------------- | ------------------------ |
| Groq          | Inferência LLM           |
| Vercel AI SDK | Streaming + Tool Calling |
| Next.js       | Backend e frontend       |
| Supabase      | Persistência             |
| TypeScript    | Tipagem e arquitetura    |

---

# 🚧 Próximas melhorias

## Planejadas

* RAG com pgvector
* memória persistente avançada
* supervisor agent
* geração procedural de puzzles
* contexto de longo prazo
* ranking de sessões
* sistema de dificuldade adaptativa

---

# 📚 Conclusão

O projeto evoluiu de um chatbot simples para uma arquitetura multi-agente modular orientada a IA generativa.

As técnicas de Prompt Engineering foram fundamentais para:

* controle de comportamento
* separação de responsabilidades
* consistência narrativa
* qualidade da experiência do jogador
* redução de respostas incorretas
* melhoria da imersão

O sistema atual demonstra aplicação prática de:

* engenharia de prompt
* multi-agent systems
* tool calling
* streaming conversacional
* arquitetura orientada a LLMs
* memória semântica avançada