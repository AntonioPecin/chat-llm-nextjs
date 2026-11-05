# Linguagem Utilizada na Criação do Chatbot

Em termos de linguagem de programação para a criação de um chatbot, minha recomendação seria Python, porque ela possui sintaxe simples, alta legibilidade e um ecossistema robusto de bibliotecas, além de atuar como um “diretor de orquestra”, integrando os diferentes componentes do sistema (como APIs, modelos de IA e bancos de dados), entre outras vantagens.

Para integrar os modelos Qwen em Python, podemos utilizar algumas abordagens. A primeira é utilizar a biblioteca da OpenAI, no modo de compatibilidade documentado pela própria Alibaba Cloud. Como as APIs do Qwen (DashScope / Alibaba Cloud Model Studio) são compatíveis com o padrão da OpenAI (com algumas limitações descritas na documentação), não é necessário utilizar uma biblioteca exclusiva do provedor, como o SDK DashScope, bastando alterar o `base_url`, a chave de API e o nome do modelo. Para instalar a biblioteca, utilize o seguinte comando no terminal:

```bash
pip install -U openai
```

Além disso, o ecossistema Qwen oferece ferramentas dedicadas, cada uma com uma finalidade específica:

- **`qwen-agent`**: framework oficial em Python para o desenvolvimento de agentes de IA, com suporte a chamadas de funções (*function calling*), RAG e interpretador de código. A instalação básica é `pip install -U qwen-agent`; para habilitar o RAG e o interpretador de código, instale também os módulos opcionais:

  ```bash
  pip install -U "qwen-agent[rag,code_interpreter]"
  ```

- **`qwen-vl-utils`**: biblioteca utilitária para quem trabalha com os modelos de visão e linguagem do Qwen (série Qwen-VL), que facilita o pré-processamento de imagens e vídeos, locais ou via URL. Instalação via terminal:

  ```bash
  pip install -U qwen-vl-utils
  ```

- **`qwen-code-sdk`**: SDK Python experimental voltado para a automação e a integração com o Qwen Code, o assistente de terminal do Qwen (requer Python 3.10 ou superior e a CLI `qwen` instalada). Instalação via terminal:

  ```bash
  pip install qwen-code-sdk
  ```

Também podemos utilizar JavaScript (ou TypeScript) na criação da interface. Quando o parâmetro `stream` da requisição à API está configurado com o valor `true`, a resposta do modelo é retornada progressivamente (*streaming* via Server-Sent Events). Ou seja, para o usuário, parecerá que o texto está sendo digitado em tempo real, acompanhando a geração da resposta pela IA. Como o JavaScript permite criar interfaces dinâmicas de forma eficiente, é altamente recomendável utilizá-lo — ou optar pelo TypeScript, para estruturar melhor a aplicação e aproveitar sua tipagem estática na construção dos componentes. Nessa arquitetura, o ideal é que a chamada à API do Qwen seja feita pelo back-end em Python, que repassa o fluxo de resposta à interface, evitando expor a chave de API no navegador.

# Tipos de Chatbot

Temos dois modelos principais que podemos implementar: o chatbot híbrido e o chatbot com IA.

## Chatbot Híbrido

O chatbot híbrido une o melhor dos dois mundos. Por um lado, conta com a lógica condicional dos chatbots baseados em regras, garantindo uma estrutura mais bem definida para o fluxo da conversa. Por outro, utiliza o poder dos modelos de linguagem (IA) para que a interação flua de forma mais dinâmica, natural e agradável.

**Exemplos de uso do chatbot híbrido:**

- Coleta de dados cadastrais de acordo com o serviço escolhido;
- Atendimento ao cliente que inicia com um fluxo de perguntas estruturadas e, em seguida, utiliza IA para responder a dúvidas mais complexas;
- Suporte na navegação e na localização de informações em sites.

**Exemplo prático de aplicação:**

Imaginemos uma situação em que o usuário informa ao chatbot que deseja agendar um atendimento para determinado serviço. Em vez de o chatbot processar todo esse comando via modelo de linguagem e consumir tokens desnecessariamente, podemos utilizar regras estruturadas ou mecanismos de reconhecimento de intenção (*intent recognition*), que identificam esse padrão e retornam uma resposta predefinida, como:

> “O atendimento seria online ou presencial?”

ou

> “Para atendimento online, acesse a Carta de Serviços; para atendimento presencial, envie seus dados para realizarmos o cadastro.”

Embora não seja possível mapear antecipadamente todas as variações de palavras que os cidadãos utilizam, é viável fazer um levantamento dos termos mais frequentes e incorporá-los ao conjunto de regras.

## Chatbot com IA

Com essa abordagem, é possível obter uma interação muito mais humanizada e com maior capacidade de compreender o contexto fornecido pelo usuário. Isso dá liberdade para a pessoa fazer perguntas naturalmente, como faria em qualquer conversa cotidiana. Além disso, o sistema pode ser aprimorado ao longo do tempo, à medida que os dados de treinamento e a base de conhecimento são atualizados e refinados.

**Exemplos de uso do chatbot com IA:**

- Assistentes virtuais (como Alexa, Siri ou Google Assistant);
- Recomendação personalizada de produtos em e-commerce;
- Suporte técnico avançado;
- Assistentes educacionais para esclarecer dúvidas teóricas de estudantes.

# Canal de Comunicação

O canal de comunicação será disponibilizado nos domínios do Governo do Estado de Mato Grosso do Sul e nos sistemas internos da equipe do Governo.

# Definição do Escopo e do Objetivo

O chatbot poderá ser utilizado pelo cidadão para esclarecer dúvidas ou atender a qualquer outro interesse que ele tenha. Já a equipe do Governo poderá utilizá-lo como ferramenta para a automatização de determinadas tarefas.
