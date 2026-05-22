import json
import re
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException

from .config import settings
from .schemas import MacroRequestCreate


RECIPE_PROMPT_VERSION = "sprint-4-micronutrients-v1"


def _format_micronutrient_targets(payload: MacroRequestCreate) -> str:
    if not payload.advanced_mode or not payload.micronutrients:
        return "- Modo avançado: desativado. Otimize apenas pelos macronutrientes e filtros informados."

    labels = {
        "vitamin_a": "Vitamina A (mcg)",
        "vitamin_c": "Vitamina C (mg)",
        "vitamin_d": "Vitamina D (UI)",
        "vitamin_e": "Vitamina E (mg)",
        "vitamin_b12": "Vitamina B12 (mcg)",
        "calcium": "Cálcio (mg)",
        "iron": "Ferro (mg)",
        "magnesium": "Magnésio (mg)",
        "potassium": "Potássio (mg)",
        "zinc": "Zinco (mg)",
    }
    values = payload.micronutrients.clean_values()
    if not values:
        return "- Modo avançado: ativado, mas sem metas específicas preenchidas."

    lines = ["- Modo avançado: ativado. Otimize também pelos micronutrientes abaixo:"]
    lines.extend(f"  - {labels[key]}: {value}" for key, value in values.items())
    return "\n".join(lines)


def build_recipe_prompt(payload: MacroRequestCreate) -> str:
    micronutrient_targets = _format_micronutrient_targets(payload)
    return f"""
Você é um agente de IA nutricional do sistema Help Food.
Gere UMA receita estruturada em português do Brasil usando os filtros abaixo.

Macronutrientes desejados por porção:
- Carboidratos: entre {payload.carbs_min}g e {payload.carbs_max}g
- Proteínas: entre {payload.protein_min}g e {payload.protein_max}g
- Gorduras: entre {payload.fat_min}g e {payload.fat_max}g
- Tipo de proteína: {payload.protein_type}
- Restrição alimentar: {payload.dietary_restriction}
- Complexidade: {payload.recipe_complexity}

Micronutrientes desejados por porção:
{micronutrient_targets}

Responda exclusivamente em JSON válido, sem markdown, no formato:
{{
  "title": "Nome da receita",
  "description": "Resumo curto da receita",
  "ingredients": ["ingrediente 1", "ingrediente 2"],
  "preparation_steps": ["passo 1", "passo 2"],
  "macros": {{
    "carbs": 0,
    "protein": 0,
    "fat": 0,
    "calories": 0
  }}
}}
""".strip()


def build_n8n_payload(payload: MacroRequestCreate, user_id: str, macro_request_id: str) -> dict[str, Any]:
    return {
        "source": "help-food",
        "prompt_version": RECIPE_PROMPT_VERSION,
        "user_id": user_id,
        "macro_request_id": macro_request_id,
        "macros": payload.model_dump(exclude={"micronutrients"}),
        "advanced_mode": payload.advanced_mode,
        "micronutrients": payload.micronutrients.clean_values() if payload.micronutrients else {},
        "prompt": build_recipe_prompt(payload),
        "expected_response_format": {
            "title": "string",
            "description": "string",
            "ingredients": ["string"],
            "preparation_steps": ["string"],
            "macros": {
                "carbs": "integer",
                "protein": "integer",
                "fat": "integer",
                "calories": "integer",
            },
            "micronutrients": {"vitamin_c": "integer", "calcium": "integer", "iron": "integer"},
        },
    }


def _extract_json_from_text(value: str) -> dict[str, Any]:
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", value, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def _normalize_n8n_response(data: Any) -> dict[str, Any]:
    if isinstance(data, list) and data:
        data = data[0]

    if isinstance(data, str):
        data = _extract_json_from_text(data)

    if not isinstance(data, dict):
        raise ValueError("Resposta da IA não está em formato JSON válido")

    # Compatibilidade com retornos comuns do n8n/OpenAI.
    for key in ("recipe", "data", "output", "text", "message"):
        nested = data.get(key)
        if isinstance(nested, dict) and "title" in nested:
            data = nested
            break
        if isinstance(nested, str):
            parsed = _extract_json_from_text(nested)
            if "title" in parsed:
                data = parsed
                break

    if "choices" in data and isinstance(data["choices"], list) and data["choices"]:
        content = data["choices"][0].get("message", {}).get("content")
        if content:
            data = _extract_json_from_text(content)

    return data


def call_n8n_recipe_webhook(payload: MacroRequestCreate, user_id: str, macro_request_id: str) -> dict[str, Any]:
    webhook_url = settings.N8N_RECIPE_WEBHOOK_URL.strip()
    if not webhook_url:
        if settings.N8N_ALLOW_MOCK_RECIPE:
            return build_mock_recipe(payload)
        raise HTTPException(
            status_code=503,
            detail="Webhook do n8n não configurado. Defina N8N_RECIPE_WEBHOOK_URL no .env.",
        )

    body = json.dumps(build_n8n_payload(payload, user_id, macro_request_id)).encode("utf-8")
    request = Request(
        webhook_url,
        data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=settings.N8N_WEBHOOK_TIMEOUT_SECONDS) as response:
            response_body = response.read().decode("utf-8")
            if not response_body.strip():
                raise ValueError("Webhook do n8n retornou resposta vazia")
            return _normalize_n8n_response(json.loads(response_body))
    except HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(status_code=502, detail=f"Erro no webhook do n8n: HTTP {exc.code} - {error_body[:300]}") from exc
    except URLError as exc:
        raise HTTPException(status_code=502, detail=f"Falha de conexão com o n8n: {exc.reason}") from exc
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail="Tempo limite excedido ao chamar o n8n") from exc
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"Resposta inválida retornada pela IA/n8n: {exc}") from exc


def build_mock_recipe(payload: MacroRequestCreate) -> dict[str, Any]:
    carbs = round((payload.carbs_min + payload.carbs_max) / 2)
    protein = round((payload.protein_min + payload.protein_max) / 2)
    fat = round((payload.fat_min + payload.fat_max) / 2)
    calories = carbs * 4 + protein * 4 + fat * 9
    return {
        "title": "Bowl equilibrado de frango com legumes",
        "description": "Receita de teste gerada localmente para validar o fluxo sem depender do n8n.",
        "ingredients": [
            "frango grelhado ou proteína compatível com o filtro",
            "arroz integral ou batata doce",
            "legumes variados",
            "azeite e temperos naturais",
        ],
        "preparation_steps": [
            "Prepare a proteína conforme o tipo selecionado.",
            "Cozinhe a fonte de carboidrato até ficar macia.",
            "Salteie os legumes com pouco azeite.",
            "Monte o prato e ajuste os temperos.",
        ],
        "macros": {"carbs": carbs, "protein": protein, "fat": fat, "calories": calories},
        "micronutrients": {
            "vitamin_a": 620,
            "vitamin_c": 85,
            "vitamin_d": 180,
            "vitamin_e": 8,
            "vitamin_b12": 2,
            "calcium": 380,
            "iron": 5,
            "magnesium": 120,
            "potassium": 900,
            "zinc": 4,
        } if payload.advanced_mode else {},
        "n8n_execution_id": "mock-local",
    }


def validate_recipe_response(data: dict[str, Any]) -> dict[str, Any]:
    macros = data.get("macros") or {}
    required = ["title", "description", "ingredients", "preparation_steps"]
    missing = [field for field in required if not data.get(field)]
    for field in ["carbs", "protein", "fat", "calories"]:
        if macros.get(field) is None:
            missing.append(f"macros.{field}")
    if missing:
        raise HTTPException(status_code=502, detail=f"Resposta da IA incompleta. Campos ausentes: {', '.join(missing)}")

    micronutrients = data.get("micronutrients") or data.get("micros") or {}
    if not isinstance(micronutrients, dict):
        micronutrients = {}

    return {
        "title": str(data["title"])[:180],
        "description": str(data["description"]),
        "ingredients": data["ingredients"] if isinstance(data["ingredients"], list) else [str(data["ingredients"])],
        "preparation_steps": data["preparation_steps"] if isinstance(data["preparation_steps"], list) else [str(data["preparation_steps"])],
        "carbs": int(macros["carbs"]),
        "protein": int(macros["protein"]),
        "fat": int(macros["fat"]),
        "calories": int(macros["calories"]),
        "micronutrients": micronutrients,
        "n8n_execution_id": data.get("n8n_execution_id") or data.get("execution_id"),
    }
