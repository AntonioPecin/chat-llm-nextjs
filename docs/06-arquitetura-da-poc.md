# Arquitetura da POC


## Visão geral

```text
Browser (app/chat.tsx, "use client")
   │ POST /api/chat { messages, model? }
   ▼
Route Handler (app/api/chat/route.ts)   ← único lugar que conhece a API key
   │ fetch ${LLM_BASE_URL}/chat/completions   (Bearer LLM_API_KEY)
   ▼
servidor Ollama (https://seu-servidor-llm.exemplo/v1)
```

## Decisões

- **Proxy no servidor.** O browser nunca fala direto com a API: a key ficaria exposta no DevTools.
- **Variáveis só no servidor.** `LLM_*` sem o prefixo `NEXT_PUBLIC_`, lidas em `lib/llm.ts`.
- **Sem SDK.** `fetch` nativo: a API é HTTP + JSON/SSE, e entender o protocolo faz parte da POC.
- **Sem memória no servidor.** O histórico fica no `useState` do chat e vai inteiro em cada request.
- **Docs no repositório.** `docs/*.md` é renderizado em `/docs` (`app/docs/lib.ts`), e o mesmo arquivo aparece no GitHub.

## Arquivos

| Arquivo | Papel |
|---|---|
| `lib/llm.ts` | Lê as variáveis de ambiente e chama a API (`chat()`, depois `chatStream()`) |
| `app/api/chat/route.ts` | Proxy do servidor. É o único caminho entre o browser e a API |
| `app/chat.tsx` |  Tela do chat (`"use client"`). O histórico fica no `useState` |
| `app/docs/lib.ts` | Lê e renderiza `docs/*.md` |

## O que eu mudaria numa versão real

## 1. Controle e Limites de Uso

Como o custo e o processamento são calculados com base na quantidade de texto gerado e processado, o limite de cota deve ser definido diretamente pelo **consumo de tokens** (e não por quantidade fixa de caracteres ou requisições simples).

* **Flexibilização por criticidade:** Recomenda-se conceder uma cota maior de tokens para serviços de alta relevância ou urgência — por exemplo, consultas de informações na área da saúde pública.

## 2. Testes de Alucinação e Calibração

Para evitar o envio de dados incorretos ou desinformação ao cidadão:

* **Checklist de estresse (Adversarial Testing):** Criar uma lista padronizada de perguntas complexas, ambíguas ou com premissas falsas que costumam induzir o modelo a erro.
* **Ajuste de prompt e RAG:** Ao identificar uma falha ou alucinação, ajustar as instruções de sistema (*system prompt*) ou reforçar a base de conhecimento (RAG) para instruir o modelo a responder com *"Não sei"* ou direcionar para um canal oficial em caso de dúvida.

## 3. Logs de Auditoria e Governança

Todas as alterações internas na configuração do agente de IA — como modificações no *system prompt*, atualização de modelos, alterações de temperatura ou substituição da base de dados vetorial — devem ser registradas em um log de auditoria.

* **Dados do log:** Registro de data/hora, tipo de modificação realizada e a identificação do usuário/desenvolvedor responsável pela alteração.

## 4. Autenticação e Prevenção de Fraudes

A autenticação do usuário final deve ser integrada à conta **Gov.br** ou a uma identidade digital oficial utilizada pelo Governo do Estado de Mato Grosso do Sul (como o sistema e-MS).

* **Motivo:** Evita o abuso da aplicação e a criação de múltiplas contas falsas (com e-mails secundários) para burlar os limites diários de tokens impostos por cidadão.

Voltar ao [README](../README.md).
