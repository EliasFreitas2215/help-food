# Sprint 3 - Integração Help Food + n8n + IA

## Objetivo

Gerar uma receita automaticamente a partir dos macronutrientes informados no frontend, usando o backend como integrador, o n8n como orquestrador da IA e o PostgreSQL como persistência final.

## Fluxo implementado

1. Usuário preenche os macronutrientes no frontend.
2. Frontend chama `POST /recipes/generate`.
3. Backend valida os dados e salva uma linha em `macro_requests`.
4. Backend envia um payload estruturado para o webhook configurado em `N8N_RECIPE_WEBHOOK_URL`.
5. n8n chama a API de IA com o prompt enviado pelo backend.
6. n8n devolve JSON estruturado da receita.
7. Backend valida a resposta da IA e salva na tabela `recipes`.
8. Frontend consulta `GET /recipes` e exibe o histórico de receitas geradas.

## Variáveis de ambiente

Adicionar no `.env`:

```env
N8N_RECIPE_WEBHOOK_URL=https://SEU_N8N/webhook/help-food/generate-recipe
N8N_WEBHOOK_TIMEOUT_SECONDS=60
N8N_ALLOW_MOCK_RECIPE=false
```

Para teste local sem n8n, use:

```env
N8N_ALLOW_MOCK_RECIPE=true
```

## Payload enviado ao n8n

```json
{
  "source": "help-food",
  "prompt_version": "sprint-3-v1",
  "user_id": "uuid-do-usuario",
  "macro_request_id": "uuid-da-solicitacao",
  "macros": {
    "carbs_min": 80,
    "carbs_max": 150,
    "protein_min": 90,
    "protein_max": 140,
    "fat_min": 20,
    "fat_max": 45,
    "protein_type": "qualquer",
    "dietary_restriction": "nenhuma",
    "recipe_complexity": "facil"
  },
  "prompt": "Prompt estruturado para IA",
  "expected_response_format": {
    "title": "string",
    "description": "string",
    "ingredients": ["string"],
    "preparation_steps": ["string"],
    "macros": {
      "carbs": "integer",
      "protein": "integer",
      "fat": "integer",
      "calories": "integer"
    }
  }
}
```

## Resposta esperada do n8n

O webhook deve retornar JSON válido neste formato:

```json
{
  "title": "Frango grelhado com arroz integral",
  "description": "Receita equilibrada para almoço ou jantar.",
  "ingredients": [
    "150g de frango",
    "120g de arroz integral",
    "Legumes variados"
  ],
  "preparation_steps": [
    "Tempere e grelhe o frango.",
    "Cozinhe o arroz integral.",
    "Monte o prato com os legumes."
  ],
  "macros": {
    "carbs": 48,
    "protein": 42,
    "fat": 12,
    "calories": 468
  },
  "n8n_execution_id": "opcional"
}
```

## Configuração sugerida no n8n

1. Crie um node **Webhook** com método `POST`.
2. Adicione um node de IA/OpenAI usando `{{$json.prompt}}` como entrada principal.
3. Configure a IA para responder somente JSON válido.
4. Adicione um node **Set** ou **Code** para garantir que a resposta final siga o formato esperado.
5. Finalize com **Respond to Webhook** retornando o JSON da receita.

## Endpoints adicionados

### `POST /recipes/generate`

Gera receita via n8n/IA, salva `macro_requests`, salva `recipes` e retorna os dois registros.

### `GET /recipes`

Lista as receitas do usuário autenticado, ordenadas da mais recente para a mais antiga.

## Script de banco

Execute:

```sql
\i database/003_create_recipes.sql
```

Ou copie o conteúdo do arquivo `database/003_create_recipes.sql` para o cliente SQL usado no PostgreSQL.

---

## Atualização Sprint 4

Para o modo avançado, consulte `docs/sprint-4-modo-avancado-micronutrientes.md`. O `prompt_version` passa a ser `sprint-4-micronutrients-v1`, e o payload pode conter `advanced_mode` e `micronutrients`.
