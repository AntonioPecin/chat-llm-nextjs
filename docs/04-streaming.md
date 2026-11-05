# Streaming de Respostas da IA

## Por que usar streaming?
Para o usuário, o uso de `stream = true` é altamente recomendado. Em vez de aguardar a resposta inteira ser processada no servidor para exibi-la de uma só vez, a interface vai renderizando o texto à medida que o agente de IA o gera (efeito de digitação). O tempo até a exibição da primeira palavra (*Time to First Token* - TTFT) é reduzido drasticamente (na casa de milissegundos). 

*Nota sobre o tempo total:* O streaming não acelera a geração total dos tokens; pelo contrário, o overhead de rede para enviar pequenos pedaços pode fazer o tempo total de conclusão ser ligeiramente maior, mas a **percepção de velocidade e usabilidade** melhora drasticamente para o usuário final.

---

## Como os dados chegam via fluxo (SSE - Server-Sent Events)

Os dados chegam estruturados em blocos prefixados por `data: `, contendo objetos JSON parciais ou a instrução de término:

```json
data: 
{
    "id": "chatcmpl-ecd08dcf-b1d3-407e-a11e-5f08ee2dfc86",
    "object": "chat.completion.chunk",
    "created": 1792150342,
    "model": "qwen3.8:27b",
    "choices": [
        {
            "index": 0,
            "delta": {
                "content": "ente"
            }
        }
    ]
}
```

```text
data: [DONE]
```

* **Estrutura do chunk:** Cada bloco contém um fragmento gerado (token ou pedaço de palavra). O caminho `choices[0].delta.content` traz especificamente o texto gerado pelo *assistente* (e não pelo usuário), livre de metadados repetitivos como `id` ou `model`.
* **Fim da transmissão:** O evento final `data: [DONE]` sinaliza que o agente concluiu inteiramente a geração da resposta.

---

## Como a POC lê o stream no Frontend

1. **Requisição HTTP:** O navegador faz uma requisição `POST` para o servidor. O servidor responde com os cabeçalhos apropriados (como `Content-Type: text/event-stream` ou `Transfer-Encoding: chunked`), indicando que a resposta será enviada em partes contínuas (*streams*).
2. **Uso da API Fetch:** A API `Fetch` permite buscar recursos na rede como uma alternativa moderna ao antigo `XHR`. Os navegadores modernos permitem consumir a resposta diretamente como um fluxo legível por meio da propriedade `Response.body`.
3. **Leitor de Fluxo (`ReadableStream`):** 
   * Para ler o corpo do fluxo, é necessário anexar um leitor utilizando o método `response.body.getReader()`. Isso cria e bloqueia um `ReadableStreamDefaultReader` no fluxo.
   * O método `reader.read()` é chamado de forma assíncrona (geralmente dentro de um loop `while`) para extrair os blocos (`chunks`) de dados à medida que chegam da rede.

---

## Armadilhas e Desafios Comuns

### 1. Quebra de linhas residuais (*Chunk fragmentation*)
Durante a leitura de um stream, é comum que um pedaço JSON ou uma linha de texto venha cortada entre um bloco e outro (por exemplo, metade de um caractere ou de uma palavra chave no limite do buffer do TCP). 

* **No Node.js:** Se estivesse processando no backend, o módulo nativo `readline` gerencia isso automaticamente.
* **No Navegador (Frontend):** Como a API `Fetch` e o `ReadableStream` entregam dados brutos (`Uint8Array`), se você tentar fazer o `JSON.parse` de uma linha quebrada, ocorrerá um erro de sintaxe. Para resolver isso de forma robusta no navegador, a estratégia padrão consiste em implementar um acumulador de texto (*buffer residual*) ou utilizar um `TransformStream` customizado para unir os pedaços cortados antes de processar as linhas do SSE.

## Referências

- [Using server-sent events (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [ReadableStream.getReader() (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/API/ReadableStream/getReader)
