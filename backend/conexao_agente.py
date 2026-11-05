import os
import requests
from typing import List, Dict, Any, Generator
from dotenv import load_dotenv

# Carrega .env.local da raiz e da pasta backend
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(BASE_DIR, ".env.local"))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(".env.local")
load_dotenv(".env")

LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://seu-servidor-llm.exemplo/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL_PADRAO = os.getenv("LLM_MODEL", "qwen3.8:27b")

def chamar_agente_llm(
    messages: List[Dict[str, str]],
    model: str = None,
    timeout: int = 60
) -> Dict[str, Any]:
    """
    Chama a API do servidor Ollama (/chat/completions) de forma síncrona.
    A chave de API é injetada estritamente no backend.
    """
    if not LLM_API_KEY:
        raise ValueError("LLM_API_KEY não configurada no .env.local")

    url = f"{LLM_BASE_URL}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LLM_API_KEY}"
    }
    payload = {
        "model": model or LLM_MODEL_PADRAO,
        "messages": messages,
        "stream": False
    }

    response = requests.post(url, headers=headers, json=payload, timeout=timeout)
    response.raise_for_status()

    dados = response.json()
    conteudo = dados.get("choices", [{}])[0].get("message", {}).get("content", "")

    return {
        "origem": "llm",
        "model": model or LLM_MODEL_PADRAO,
        "content": conteudo
    }

def chamar_agente_llm_stream(
    messages: List[Dict[str, str]],
    model: str = None,
    timeout: int = 60
) -> Generator[bytes, None, None]:
    """
    Chama a API do servidor Ollama com stream=True e devolve gerador para SSE.
    """
    if not LLM_API_KEY:
        raise ValueError("LLM_API_KEY não configurada no .env.local")

    url = f"{LLM_BASE_URL}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LLM_API_KEY}"
    }
    payload = {
        "model": model or LLM_MODEL_PADRAO,
        "messages": messages,
        "stream": True
    }

    with requests.post(url, headers=headers, json=payload, timeout=timeout, stream=True) as response:
        response.raise_for_status()
        for chunk in response.iter_content(chunk_size=None):
            if chunk:
                yield chunk
