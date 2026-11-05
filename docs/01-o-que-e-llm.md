# O que é uma LLM

## Em uma frase

- É um sistema de inteligência artificial treinado com um imenso volume de dados textuais para entender, resumir, traduzir e gerar textos semelhantes aos produzidos por humanos.

# Teste de Consumo de Tokens na Geração de Texto

Foi realizado um teste para medir o consumo de *tokens* durante a geração de resposta a partir do seguinte *prompt*:

> *"Para os gregos, o que importava era a jornada, o ato de tentar, de se colocar num confronto com o destino — mesmo sabendo que, no final, não importava seu esforço, porque os deuses tomavam as rédeas de seus destinos."*

---

## Resultados dos Modelos

### 1. `qwen3.8:27b` (27 bilhões de parâmetros)
* ***Completion tokens* registrados:** 995 *tokens*
* **Volume total gerado (Resposta + CoT):** 3.861 caracteres (com espaços) / ~3.200 caracteres (sem espaços)
* **Média por *token*:** ~3,88 caracteres por *token* (respeitando a estimativa padrão de 1 *token* $\approx$ 3 a 4 caracteres ou ~0,75 a 0,8 palavras)
* **Observação:** O modelo utilizou raciocínio interno (*Chain of Thought* / CoT) em inglês antes de apresentar a resposta final em português. Como o processo de raciocínio foi executado em inglês (ex.: *"The user is making a statement..."*), a eficiência do tokenizador foi maior ($\approx$ 4 caracteres por *token*), o que elevou a média geral de eficiência para 3,88 caracteres/token.

---

### 2. `gpt-oss:20b` (20 bilhões de parâmetros)
* ***Completion tokens* registrados:** 1.783 *tokens*
* **Volume total gerado (*content*):** ~7.500 caracteres (com espaços)
* **Média por *token*:** ~4,2 caracteres por *token*
* **Observação:** O modelo segue uma estrutura semelhante à do `qwen3.8:27b`, separando o conteúdo final (*content*) do raciocínio interno (*reasoning_content*), o que otimiza a eficiência na contagem e no aproveitamento dos *tokens*.

## Tokens

- Um token é a unidade básica de processamento de texto. Por exemplo, a palavra original "Inconstitucionalissimamente" pode ser dividida nos seguintes tokens: “In”, “constitucional” e “issimamente”.
- Se o modelo tivesse que aprender cada palavra única do mundo (incluindo gírias, plurais e conjugações), a quantidade de dados seria infinita. Ao utilizar pedaços de palavras, ele consegue formar qualquer palavra existente combinando esses fragmentos.

## Janela de contexto

- Para evitar sobrecarga ou travamentos, o agente começa a esquecer trechos mais antigos da conversa. Por exemplo, se você disser seu nome na primeira pergunta, na décima ele poderá já não se lembrar dele.
- O histórico da conversa não fica salvo no servidor; ele é mantido no useState do chat e enviado por inteiro a cada requisição.

## Temperatura e outros parâmetros

- A diferença na resposta dos prompts ocorreu no campo "completion_tokens", no qual o prompt configurado com temperatura 1 consumiu mais tokens.

## Alucinação e limites

- "Faça-me uma pergunta muito específica, com uma premissa sutilmente falsa, e me pressione a dar uma resposta única — e, com alguma probabilidade, eu entregarei uma frase bem escrita e totalmente inventada."
- **Como contornar:**
  - **Prompt de sistema:** Instruir o modelo explicitamente no *system prompt* a admitir quando não souber a resposta, a nunca inventar informações e a responder com *"Não sei"* ou indicar canais oficiais quando não houver certeza.
  - **RAG (Recuperação Aumentada por Geração):** Fornecer documentos e fatos de fontes confiáveis diretamente no contexto do prompt, permitindo que a LLM sintetize respostas com base estrita no texto fornecido (*grounding*), em vez de tentar adivinhar a partir de seus pesos estatísticos. Para mais detalhes, veja [Embeddings e RAG](05-embeddings-e-rag.md).

## Referências

- [Intro to Large Language Models — Andrej Karpathy (vídeo)](https://www.youtube.com/watch?v=zjkBMFhNj_g)
- [The Illustrated Transformer — Jay Alammar](https://jalammar.github.io/illustrated-transformer/)
