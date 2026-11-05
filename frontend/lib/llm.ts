// Cliente da API LLM (padrão OpenAI). Só roda no servidor: a key nunca vai para o browser.
// Quem chama isto é app/api/chat/route.ts. Ver PLANO.md, etapas 1 e 3.

export type Role = "system" | "user" | "assistant";
export type Message = {
  role: Role;
  content: string;
  origem?: "base_conhecimento" | "llm";
  model?: string;
};

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ${name} ausente. Configure no .env.local.`);
  return value;
}

export const llmConfig = () => ({
  baseUrl: env("LLM_BASE_URL"),
  apiKey: env("LLM_API_KEY"),
  model: process.env.LLM_MODEL ?? "qwen3.8:27b",
});

// Etapa 1: POST /chat/completions sem stream — devolve o texto completo
export async function chat(messages: Message[], opts: { model?: string } = {}): Promise<string> {
  const { baseUrl, apiKey, model } = llmConfig();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(60_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API da LLM retornou ${res.status}: ${text}`);
  }

  const json = await res.json();
  return (json.choices?.[0]?.message?.content as string) ?? "";
}

// Etapa 3: POST /chat/completions com stream: true — devolve o ReadableStream SSE bruto
export async function chatStream(
  messages: Message[],
  opts: { model?: string } = {}
): Promise<ReadableStream<Uint8Array>> {
  const { baseUrl, apiKey, model } = llmConfig();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(60_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API da LLM retornou ${res.status}: ${text}`);
  }

  if (!res.body) throw new Error("Resposta sem stream de dados");
  return res.body;
}
