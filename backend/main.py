import os
import sys
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

# Adiciona o diretório atual ao path
sys.path.insert(0, os.path.dirname(__file__))

from pergunta_base_conhecimento import verificar_pergunta_na_base
from conexao_agente import chamar_agente_llm, chamar_agente_llm_stream

app = FastAPI(
    title="POC LLM - Backend API",
    description="Backend da POC LLM integrando Base de Conhecimento e modelos de IA via API compatível com OpenAI.",
    version="1.0.0"
)

# Configuração de CORS para permitir requisições do frontend TypeScript (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str = Field(..., description="Papel: 'user', 'assistant' ou 'system'")
    content: str = Field(..., description="Conteúdo textual da mensagem")

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_items=1, description="Histórico de mensagens")
    model: Optional[str] = Field(None, description="Modelo de IA solicitado")
    stream: Optional[bool] = Field(False, description="Se deve retornar fluxo SSE (Server-Sent Events)")

@app.get("/")
def raiz():
    return {
        "status": "online",
        "servico": "POC LLM - Backend",
        "docs": "/docs",
        "endpoints": ["/api/chat", "/health"]
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat_endpoint(requisicao: ChatRequest):
    """
    Roteador de pergunta conforme arquitetura do PLANO.md:
    Frontend (TypeScript) -> Backend (FastAPI) -> [ Base Conhecimento | conexao_agente.py (LLM) ]
    """
    messages_dict = [{"role": m.role, "content": m.content} for m in requisicao.messages]

    # Extrai o texto da última mensagem enviada pelo usuário
    ultima_pergunta = ""
    for msg in reversed(requisicao.messages):
        if msg.role == "user":
            ultima_pergunta = msg.content.strip()
            break

    # 1. Verifica se a pergunta está cadastrada na Base de Conhecimento
    resposta_base = verificar_pergunta_na_base(ultima_pergunta)
    if resposta_base:
        return JSONResponse(content={
            "content": resposta_base["content"],
            "origem": "base_conhecimento",
            "id": resposta_base.get("id")
        })

    # 2. Pergunta não encontrada na base: chama o modelo de IA
    try:
        if requisicao.stream:
            gerador = chamar_agente_llm_stream(
                messages=messages_dict,
                model=requisicao.model
            )
            return StreamingResponse(
                gerador,
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "x-origem": "llm"
                }
            )
        else:
            resposta_llm = chamar_agente_llm(
                messages=messages_dict,
                model=requisicao.model
            )
            return JSONResponse(content={
                "content": resposta_llm["content"],
                "origem": "llm",
                "model": resposta_llm.get("model")
            })
    except Exception as e:
        erro_msg = str(e)
        status_code = status.HTTP_504_GATEWAY_TIMEOUT if "timeout" in erro_msg.lower() else (
            status.HTTP_401_UNAUTHORIZED if "401" in erro_msg else status.HTTP_502_BAD_GATEWAY
        )
        raise HTTPException(status_code=status_code, detail=f"Erro no agente LLM: {erro_msg}")

if __name__ == "__main__":
    import uvicorn
    porta = int(os.environ.get("PORT", 8000))
    print(f"Iniciando Backend FastAPI em http://localhost:{porta}")
    uvicorn.run("main:app", host="0.0.0.0", port=porta, reload=True)
