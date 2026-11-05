import json
import os
import re
import unicodedata
from typing import Optional, Dict, Any

CAMINHO_BASE = os.path.join(os.path.dirname(__file__), "base_conhecimento.json")

def normalizar_texto(texto: str) -> str:
    """Remove acentos, pontuação e converte para minúsculas para comparação robusta."""
    texto = unicodedata.normalize("NFKD", texto).encode("ASCII", "ignore").decode("utf-8")
    texto = re.sub(r"[^\w\s]", " ", texto.lower())
    return " ".join(texto.split())

def carregar_base_conhecimento() -> list:
    """Carrega as perguntas e respostas pré-definidas da base de conhecimento."""
    if not os.path.exists(CAMINHO_BASE):
        return []
    try:
        with open(CAMINHO_BASE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Erro ao carregar base de conhecimento: {e}")
        return []

def verificar_pergunta_na_base(pergunta: str) -> Optional[Dict[str, Any]]:
    """
    Verifica se a pergunta do usuário é compatível com a base de conhecimento.
    Se for, retorna a resposta pré-definida, quebrando o fluxo e economizando
    recursos do modelo de IA (conforme Etapa 3 do PLANO.md).
    """
    pergunta_norm = normalizar_texto(pergunta)
    base = carregar_base_conhecimento()

    for item in base:
        for chave in item.get("palavras_chave", []):
            chave_norm = normalizar_texto(chave)
            if chave_norm and (chave_norm in pergunta_norm or pergunta_norm in chave_norm):
                return {
                    "origem": "base_conhecimento",
                    "id": item.get("id"),
                    "content": item.get("resposta")
                }
    
    return None
