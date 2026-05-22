-- Sprint 3 - tabela de receitas geradas pela IA
-- Execute este script no banco PostgreSQL usado pelo Help Food.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    macro_request_id UUID NULL REFERENCES macro_requests(id) ON DELETE SET NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    preparation_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    carbs INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    fat INTEGER NOT NULL,
    calories INTEGER NOT NULL,
    protein_type VARCHAR(50) NOT NULL,
    dietary_restriction VARCHAR(50) NOT NULL,
    recipe_complexity VARCHAR(30) NOT NULL,
    n8n_execution_id VARCHAR(120) NULL,
    raw_ai_response JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS ix_recipes_macro_request_id ON recipes(macro_request_id);
CREATE INDEX IF NOT EXISTS ix_recipes_created_at ON recipes(created_at DESC);
