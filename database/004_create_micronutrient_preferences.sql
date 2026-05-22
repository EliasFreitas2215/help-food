-- Sprint 4 - modo avançado com controle de micronutrientes
-- Execute este script no banco PostgreSQL usado pelo Help Food.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE macro_requests
    ADD COLUMN IF NOT EXISTS advanced_mode BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS micronutrient_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    macro_request_id UUID NOT NULL REFERENCES macro_requests(id) ON DELETE CASCADE,
    vitamin_a INTEGER NULL,
    vitamin_c INTEGER NULL,
    vitamin_d INTEGER NULL,
    vitamin_e INTEGER NULL,
    vitamin_b12 INTEGER NULL,
    calcium INTEGER NULL,
    iron INTEGER NULL,
    magnesium INTEGER NULL,
    potassium INTEGER NULL,
    zinc INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_micronutrient_non_negative CHECK (
        COALESCE(vitamin_a, 0) >= 0 AND
        COALESCE(vitamin_c, 0) >= 0 AND
        COALESCE(vitamin_d, 0) >= 0 AND
        COALESCE(vitamin_e, 0) >= 0 AND
        COALESCE(vitamin_b12, 0) >= 0 AND
        COALESCE(calcium, 0) >= 0 AND
        COALESCE(iron, 0) >= 0 AND
        COALESCE(magnesium, 0) >= 0 AND
        COALESCE(potassium, 0) >= 0 AND
        COALESCE(zinc, 0) >= 0
    )
);

ALTER TABLE recipes
    ADD COLUMN IF NOT EXISTS micronutrients JSONB NULL;

CREATE INDEX IF NOT EXISTS ix_micronutrient_preferences_user_id ON micronutrient_preferences(user_id);
CREATE INDEX IF NOT EXISTS ix_micronutrient_preferences_macro_request_id ON micronutrient_preferences(macro_request_id);
CREATE INDEX IF NOT EXISTS ix_recipes_micronutrients ON recipes USING GIN (micronutrients);
