# Sprint 4 - Modo Avançado com Micronutrientes

## Objetivo

Permitir personalização nutricional avançada com vitaminas e minerais, mantendo o fluxo atual de macronutrientes funcionando sem alterações obrigatórias para o usuário.

## Critérios de aceite atendidos

- Botão **Modo Avançado** no frontend.
- Questionário de micronutrientes com validação visual.
- Tabela `micronutrient_preferences` para persistência das preferências avançadas.
- Backend atualizado para receber `advanced_mode` e `micronutrients`.
- Payload do n8n atualizado para incluir micronutrientes.
- Prompt da IA atualizado para otimização por vitaminas e minerais.
- Retorno nutricional detalhado estruturado em `recipe.micronutrients`.
- Exibição da tabela nutricional detalhada no frontend.

## Payload enviado pelo frontend

```json
{
  "advanced_mode": true,
  "micronutrients": {
    "vitamin_a": 700,
    "vitamin_c": 90,
    "vitamin_d": 600,
    "calcium": 1000,
    "iron": 18,
    "magnesium": 400,
    "potassium": 3500,
    "zinc": 11
  },
  "carbs_min": 80,
  "carbs_max": 150,
  "protein_min": 90,
  "protein_max": 140,
  "fat_min": 20,
  "fat_max": 45,
  "protein_type": "qualquer",
  "dietary_restriction": "nenhuma",
  "recipe_complexity": "facil"
}
```

## Payload enviado ao n8n

```json
{
  "source": "help-food",
  "prompt_version": "sprint-4-micronutrients-v1",
  "user_id": "uuid-do-usuario",
  "macro_request_id": "uuid-da-solicitacao",
  "macros": {
    "advanced_mode": true,
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
  "advanced_mode": true,
  "micronutrients": {
    "vitamin_c": 90,
    "calcium": 1000,
    "iron": 18
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
    },
    "micronutrients": {
      "vitamin_c": "integer",
      "calcium": "integer",
      "iron": "integer"
    }
  }
}
```

## Resposta esperada da IA/n8n

```json
{
  "title": "Bowl de frango com legumes ricos em micronutrientes",
  "description": "Receita equilibrada com foco em proteínas, fibras, vitaminas e minerais.",
  "ingredients": ["150g de frango", "legumes variados", "arroz integral"],
  "preparation_steps": ["Prepare a proteína.", "Cozinhe os acompanhamentos.", "Monte o prato."],
  "macros": {
    "carbs": 48,
    "protein": 42,
    "fat": 12,
    "calories": 468
  },
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
    "zinc": 4
  },
  "n8n_execution_id": "opcional"
}
```

## Banco de dados

Execute o script abaixo depois dos scripts anteriores:

```sql
\i database/004_create_micronutrient_preferences.sql
```

O script adiciona:

- Coluna `advanced_mode` em `macro_requests`.
- Tabela `micronutrient_preferences`.
- Coluna `micronutrients` em `recipes`.

## Teste recomendado

1. Subir backend e frontend normalmente.
2. Acessar a tela de macronutrientes.
3. Clicar em **Ativar Modo Avançado**.
4. Preencher pelo menos um micronutriente.
5. Clicar em **Gerar receita com IA**.
6. Validar se a receita aparece com a tabela nutricional detalhada.
7. Conferir no banco as tabelas `macro_requests`, `micronutrient_preferences` e `recipes`.
