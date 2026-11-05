# Guia de Configuração e Consumo de APIs de IA (Compatíveis com OpenAI)

## O que significa "compatível com OpenAI"
Significa que os sistemas utilizam os mesmos protocolos HTTP padrão. Isso permite trocar de agente de IA apenas alterando a URL base (`baseUrl`) e, se necessário, as chaves de API (`APIKey`). Com isso, é possível aproveitar todo o ecossistema existente, como frameworks, SDKs e interfaces gráficas.

---

## Autenticação
O cabeçalho `Authorization: Bearer` funciona de forma semelhante a uma variável de ambiente que armazena o valor da sua `APIKey`. 

> **Atenção sobre segurança:** A chave de API nunca deve ser exposta no código do frontend (no navegador). Caso um usuário mal-intencionado inspecione as informações da aplicação, ele poderá visualizar a chave e comprometer a segurança da conta.

---

## Endpoints Usados
Geralmente, todas as requisições utilizam o método `POST` (exceto para listagem) combinando a URL base com o caminho específico do endpoint, ficando no formato `{{baseUrl}}/chat/completions`.

| Método | Caminho | Descrição |
| :--- | :--- | :--- |
| `GET` | `/v1/models` | Retorna um array com todos os modelos disponíveis e suas características. |
| `POST` | `/v1/chat/completions` | Endpoint de conexão para conversação com o agente de IA. |
| `POST` | `/v1/embeddings` | Endpoint para geração de vetores de texto (*embeddings*). |

### Configuração no Postman
No Postman, foram criadas variáveis para facilitar os testes:
* **`baseUrl`**: Armazena o endereço base da API.
* **`chatModel` / APIKey**: Chave de autenticação em formato *Bearer Token* (utilizada de forma centralizada, visto que muitos agentes utilizam a mesma chave).

#### Headers (Cabeçalhos)
```http
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

#### Body (Corpo da Requisição - `raw` / JSON)
O corpo da requisição é estruturado com os seguintes campos principais:
1. **`model`**: Define qual modelo de IA será utilizado (ex.: `{{chatModel}}`).
2. **`messages`**: Um array de objetos JSON que representa o histórico da conversa e as instruções. Cada objeto possui os campos `role` e `content`:
   * **`system`**: Define o comportamento global, persona, tom ou restrições iniciais do modelo (ex.: `"Você é um assistente útil. Responda em português."`). Apenas o conteúdo de `content` deve ser alterado conforme a necessidade.
   * **`user`**: Representa a pergunta ou comando enviado pelo usuário final (ex.: `"Me diga alguma ideia de Platão."`).
   * **`assistant`**: Representa a resposta gerada pelo modelo.
3. **`temperature`**: Controla a criatividade e a aleatoriedade da resposta (valores mais altos geram respostas mais variadas).
4. **`stream`**: Define se a resposta da IA será enviada em tempo real à medida que é gerada (`true`) ou entregue por completo apenas no final (`false`).

---

## Exemplo Prático de Requisição e Resposta

### Requisição (Payload enviado)
```json
{
  "model": "{{chatModel}}",
  "messages": [
    { "role": "system", "content": "Você é um assistente útil. Responda em português. Seja simples, direto, objetivo e curto." },
    { "role": "user", "content": "Me diga alguma ideia de Platão." }
  ],
  "temperature": 1.0,
  "stream": false
}
```

### Resposta da API
```json
{
  "id": "chatcmpl-87514814-5c9e-46d3-ade0-f5db63f25f44",
  "created": 1792064984,
  "model": "qwen3.8:27b",
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "**Mundo das Ideias (Formas):** Para Platão, o que vemos ao redor é apenas uma \"sombra imperfeita\" de uma forma ideal e eterna. A verdadeira realidade são essas Formas perfeitas e imutáveis, acessíveis pela razão, não pelos sentidos.",
        "role": "assistant"
      }
    }
  ],
  "usage": {
    "completion_tokens": 206,
    "prompt_tokens": 50,
    "total_tokens": 256
  }
}
```

---

## Anatomia da Resposta

* **`choices[0].message.content`**: Contém o texto principal gerado pela resposta da IA.
* **`finish_reason`**: Indica o motivo pelo qual o modelo encerrou a geração do texto (por exemplo, `stop` indica que a resposta foi concluída normalmente).
* **`usage`**: Apresenta métricas de consumo de *tokens* (`prompt_tokens`, `completion_tokens` e `total_tokens`).

---

## Erros Encontrados
* Nenhum erro técnico foi encontrado na estrutura apresentada.