"use client";

import { useState, useRef, useEffect } from "react";
import type { Message } from "@/lib/llm";

interface ExtendedMessage extends Message {
  id: string;
  timestamp: string;
}

const CHAT_MODELS = [
  { id: "qwen3.8:27b", label: "Qwen3 27B", desc: "Alta qualidade (Recomendado)" },
  { id: "gpt-oss:20b", label: "GPT-OSS 20B", desc: "Respostas mais rápidas" },
  { id: "nemotron-cascade-2:latest", label: "Nemotron Cascade 2", desc: "Respostas aprofundadas" },
];

const PERGUNTAS_SUGERIDAS = [
  { titulo: "Agendamento", pergunta: "Como faço para agendar uma consulta presencial ou online?" },
  { titulo: "Horários", pergunta: "Qual é o horário de atendimento e funcionamento das unidades?" },
  { titulo: "Vacinação", pergunta: "Onde posso tomar vacina e quais documentos levar?" },
  { titulo: "Carta de Serviços", pergunta: "O que é e como acesso a Carta de Serviços de MS?" },
];

export function Chat() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS[0].id);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [useStream, setUseStream] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLLIElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll sempre que novas mensagens ou chunks chegarem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  function getHoraAtual(): string {
    const agora = new Date();
    return agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  async function handleEnviar(textoManual?: string) {
    const texto = (textoManual ?? input).trim();
    if (!texto || loading) return;

    setError(null);
    setInput("");

    const novaMensagemUsuario: ExtendedMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: texto,
      timestamp: getHoraAtual(),
    };

    const novoHistorico = [...messages, novaMensagemUsuario];
    setMessages(novoHistorico);
    setLoading(true);

    try {
      if (useStream) {
        // Fluxo de streaming SSE
        setStreamingContent("");
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: novoHistorico.map((m) => ({ role: m.role, content: m.content })),
            model: selectedModel,
            stream: true,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(errData.error ?? `Erro HTTP ${res.status}`);
        }

        const contentType = res.headers.get("content-type") ?? "";

        // Se o backend retornou JSON direto (ex.: pergunta resolvida na Base de Conhecimento)
        if (contentType.includes("application/json")) {
          const json = await res.json();
          setMessages([
            ...novoHistorico,
            {
              id: "asst-" + Date.now(),
              role: "assistant",
              content: json.content,
              origem: json.origem,
              model: json.model,
              timestamp: getHoraAtual(),
            },
          ]);
          setStreamingContent(null);
          return;
        }

        // Leitura contínua do fluxo SSE com buffer residual
        const reader = res.body?.getReader();
        if (!reader) throw new Error("Stream indisponível no navegador");

        const decoder = new TextDecoder();
        let buffer = "";
        let acumulado = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const linhas = buffer.split("\n");
          buffer = linhas.pop() ?? "";

          for (const linha of linhas) {
            const linhaLimpa = linha.trim();
            if (!linhaLimpa.startsWith("data: ")) continue;
            const dados = linhaLimpa.slice(6).trim();
            if (dados === "[DONE]") break;

            try {
              const chunk = JSON.parse(dados);
              const delta = chunk.choices?.[0]?.delta?.content ?? "";
              acumulado += delta;
              setStreamingContent(acumulado);
            } catch {
              // buffer parcial aguarda próximo chunk
            }
          }
        }

        if (acumulado) {
          setMessages([
            ...novoHistorico,
            {
              id: "asst-" + Date.now(),
              role: "assistant",
              content: acumulado,
              origem: "llm",
              model: selectedModel,
              timestamp: getHoraAtual(),
            },
          ]);
        }
      } else {
        // Fluxo direto síncrono
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: novoHistorico.map((m) => ({ role: m.role, content: m.content })),
            model: selectedModel,
            stream: false,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(errData.error ?? `Erro HTTP ${res.status}`);
        }

        const json = await res.json();
        setMessages([
          ...novoHistorico,
          {
            id: "asst-" + Date.now(),
            role: "assistant",
            content: json.content,
            origem: json.origem,
            model: json.model,
            timestamp: getHoraAtual(),
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
      setStreamingContent(null);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  }

  function handleCopiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function handleLimpar() {
    setMessages([]);
    setError(null);
    setStreamingContent(null);
    setInput("");
    textareaRef.current?.focus();
  }

  return (
    <div className="chat-app">
      {/* Barra de Ferramentas Superior */}
      <div className="chat-app__toolbar">
        <div className="chat-app__model-group">
          <label htmlFor="model-select" className="toolbar-label">
            Agente IA:
          </label>
          <select
            id="model-select"
            className="toolbar-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loading}
          >
            {CHAT_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.desc}
              </option>
            ))}
          </select>
        </div>

        <div className="chat-app__actions">
          <label className="stream-toggle" title="Receber palavras em tempo real via Server-Sent Events">
            <input
              type="checkbox"
              checked={useStream}
              onChange={(e) => setUseStream(e.target.checked)}
              disabled={loading}
            />
            <span>Streaming</span>
          </label>

          {messages.length > 0 && (
            <button
              type="button"
              className="toolbar-btn toolbar-btn--danger"
              onClick={handleLimpar}
              disabled={loading}
              title="Reiniciar histórico da conversa"
            >
              Limpar Conversa
            </button>
          )}
        </div>
      </div>

      {/* Janela de Mensagens */}
      <ol className="chat-app__messages" aria-live="polite">
        {messages.length === 0 && !loading && (
          <li className="welcome-banner">
            <div className="welcome-banner__icon">🏛️</div>
            <h2>Olá! Como podemos ajudar você hoje?</h2>
            <p>
              Sou um <strong>assistente de serviços públicos</strong> (prova de conceito).
              Perguntas frequentes sobre agendamentos e serviços de saúde são respondidas instantaneamente
              pela nossa <strong>Base de Conhecimento</strong>. Para dúvidas complexas, acionamos nossos agentes de IA.
            </p>

            <div className="welcome-banner__chips">
              <span className="chips-title">Sugestões de perguntas frequentes:</span>
              <div className="chips-list">
                {PERGUNTAS_SUGERIDAS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chip-btn"
                    onClick={() => handleEnviar(item.pergunta)}
                  >
                    <span className="chip-btn__tag">{item.titulo}</span>
                    <span className="chip-btn__text">{item.pergunta}</span>
                  </button>
                ))}
              </div>
            </div>
          </li>
        )}

        {messages.map((m) => (
          <li key={m.id} className={`msg-bubble msg-bubble--${m.role}`}>
            <div className="msg-bubble__header">
              <div className="msg-bubble__author">
                <span className="author-avatar">{m.role === "user" ? "👤" : "MS"}</span>
                <span className="author-name">{m.role === "user" ? "Você" : "Atendimento MS"}</span>
              </div>

              <div className="msg-bubble__meta">
                {m.origem && (
                  <span
                    className={`badge-origin ${
                      m.origem === "base_conhecimento" ? "badge-origin--base" : "badge-origin--llm"
                    }`}
                  >
                    {m.origem === "base_conhecimento"
                      ? "⚡ Base de Conhecimento"
                      : `🤖 ${m.model || "LLM"}`}
                  </span>
                )}
                <span className="msg-time">{m.timestamp}</span>
              </div>
            </div>

            <div className="msg-bubble__body">{m.content}</div>

            {m.role === "assistant" && (
              <div className="msg-bubble__footer">
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => handleCopiar(m.content, m.id)}
                  title="Copiar resposta"
                >
                  {copiedId === m.id ? "✓ Copiado!" : "📋 Copiar"}
                </button>
              </div>
            )}
          </li>
        ))}

        {/* Bolha de streaming em tempo real */}
        {streamingContent !== null && (
          <li className="msg-bubble msg-bubble--assistant msg-bubble--streaming">
            <div className="msg-bubble__header">
              <div className="msg-bubble__author">
                <span className="author-avatar">MS</span>
                <span className="author-name">Atendimento MS</span>
              </div>
              <span className="badge-origin badge-origin--llm">
                🤖 {selectedModel} (gerando…)
              </span>
            </div>
            <div className="msg-bubble__body">
              {streamingContent || (
                <span className="streaming-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              )}
            </div>
          </li>
        )}

        <li ref={bottomRef} aria-hidden="true" style={{ listStyle: "none" }} />
      </ol>

      {/* Banner de Erro */}
      {error && (
        <div className="chat-error-card" role="alert">
          <span className="error-icon">⚠️</span>
          <div className="error-content">
            <strong>Ocorreu um erro no processamento:</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="error-close" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Formulário de Envio */}
      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          handleEnviar();
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua dúvida ou comando… (Enter envia, Shift+Enter pula linha)"
          rows={2}
          disabled={loading}
          required
        />

        <button
          type="submit"
          className="send-button"
          disabled={loading || !input.trim()}
          aria-label={loading ? "Aguardando resposta…" : "Enviar mensagem"}
        >
          {loading ? (
            <span className="spinner-loader" aria-hidden="true" />
          ) : (
            <>
              <span>Enviar</span>
              <span className="send-icon">➤</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
