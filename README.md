
## Sprint 4 - Modo Avançado com Micronutrientes

Esta versão adiciona a fase 4 do projeto, com controle opcional de micronutrientes no fluxo de geração de receitas.

### Principais mudanças

- Botão **Modo Avançado** na tela de macronutrientes.
- Questionário avançado para vitaminas e minerais.
- Envio de `advanced_mode` e `micronutrients` para o backend e n8n.
- Prompt da IA atualizado para retornar nutrição detalhada.
- Nova tabela `micronutrient_preferences`.
- Nova coluna `recipes.micronutrients` para armazenar o retorno nutricional detalhado.
- Exibição da tabela nutricional detalhada no frontend.

### Banco de dados

Execute após os scripts anteriores:

```sql
\i database/004_create_micronutrient_preferences.sql
```

### Documentação

Consulte `docs/sprint-4-modo-avancado-micronutrientes.md` para payloads, resposta esperada do n8n e roteiro de testes.
