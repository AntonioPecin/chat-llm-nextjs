// POST /api/chat (Next.js Frontend BFF)
// Repassa a requisição para o backend oficial em Python (FastAPI).

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corpo da requisição deve ser JSON" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get("content-type") || "";

    // Se o backend Python retornou stream SSE
    if (contentType.includes("text/event-stream") && res.body) {
      return new Response(res.body, {
        status: res.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Se o backend Python retornou JSON
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errMsg = data?.detail || data?.error || `Erro HTTP ${res.status}`;
      return Response.json({ error: errMsg }, { status: res.status });
    }

    return Response.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao conectar com o backend Python";
    return Response.json(
      {
        error: `Falha de conexão com o backend Python (${BACKEND_URL}): ${message}. Certifique-se de que o backend Python está rodando na porta 8000.`,
      },
      { status: 502 }
    );
  }
}
