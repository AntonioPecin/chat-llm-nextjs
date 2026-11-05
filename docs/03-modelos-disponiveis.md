# Modelos Disponíveis


## Comparativo

| Modelo | Tipo | Tempo médio de resposta (s) | Qualidade em português | Quando usar |
| :--- | :--- | :--- | :--- | :--- |
| `qwen3.8:27b` | Chat (Recomendado) | 25.33 | Vocabulário de alta qualidade, conseguindo mesclar línguas diferentes com precisão. | Utilizar para respostas mais focadas e diretas. |
| `gpt-oss:20b` | Chat | 14.21 | Vocabulário de alta qualidade, conseguindo mesclar línguas diferentes. | Utilizar para respostas mais robustas e complexas. |
| `nemotron-cascade-2:latest` | Chat | 18.23 | Vocabulário de alta qualidade, mas mesclou um idioma sem relação com a pergunta. | Utilizar apenas em casos específicos; gerou um texto muito longo. |
| `qwen3-embedding:8b` | Embedding | — | — | Busca vetorial / RAG ([ver](05-embeddings-e-rag.md)). |

---

## O que "27b" e "20b" querem dizer?

O **"B"** vem de *billions* (bilhões) e indica o número de parâmetros, o que reflete o tamanho e a capacidade de processamento do modelo de IA. O número que vem antes indica a quantidade exata: por exemplo, **27b** refere-se a um modelo com 27 bilhões de parâmetros (como o *Gemma-3-27B* ou o *Qwen3.5-27B*).

* **Qualidade:** Modelos com 27B costumam entregar maior qualidade, pois o número de parâmetros determina a capacidade da IA de armazenar e relacionar conhecimento.
* **Velocidade:** Modelos de 20B respondem com mais rapidez e exigem menos poder de processamento por palavra gerada.
* **Memória (RAM/VRAM):** Os parâmetros do modelo precisam ser carregados por inteiro na memória do servidor ou computador. Portanto, um modelo de 27B exige mais memória operacional para rodar.

---

## Prompt Usado no Teste

```text
Para os gregos o que importava era a jornada, o ato de tentar, de se colocar num confronto do destino mesmo sabendo que no final não importava seu esforço, porque os deuses tomavam as rédeas de seus destinos.
```