from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

PROTEIN_TYPES = {
    "qualquer",
    "frango",
    "carne_bovina",
    "peixe",
    "ovo",
    "suina",
    "vegetal",
}

DIETARY_RESTRICTIONS = {
    "nenhuma",
    "vegetariana",
    "vegana",
    "sem_lactose",
    "sem_gluten",
}

RECIPE_COMPLEXITIES = {
    "facil",
    "media",
    "avancada",
}


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    cpf: str | None = None

    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None

    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


MICRONUTRIENT_FIELDS = {
    "vitamin_a",
    "vitamin_c",
    "vitamin_d",
    "vitamin_e",
    "vitamin_b12",
    "calcium",
    "iron",
    "magnesium",
    "potassium",
    "zinc",
}


class MicronutrientPreferenceCreate(BaseModel):
    vitamin_a: int | None = Field(default=None, ge=0, le=5000)
    vitamin_c: int | None = Field(default=None, ge=0, le=3000)
    vitamin_d: int | None = Field(default=None, ge=0, le=4000)
    vitamin_e: int | None = Field(default=None, ge=0, le=1000)
    vitamin_b12: int | None = Field(default=None, ge=0, le=5000)
    calcium: int | None = Field(default=None, ge=0, le=3000)
    iron: int | None = Field(default=None, ge=0, le=100)
    magnesium: int | None = Field(default=None, ge=0, le=1000)
    potassium: int | None = Field(default=None, ge=0, le=6000)
    zinc: int | None = Field(default=None, ge=0, le=100)

    def clean_values(self) -> dict:
        return {key: value for key, value in self.model_dump().items() if value is not None}


class MicronutrientPreferenceResponse(BaseModel):
    id: str
    user_id: str
    macro_request_id: str
    vitamin_a: int | None = None
    vitamin_c: int | None = None
    vitamin_d: int | None = None
    vitamin_e: int | None = None
    vitamin_b12: int | None = None
    calcium: int | None = None
    iron: int | None = None
    magnesium: int | None = None
    potassium: int | None = None
    zinc: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MacroRequestCreate(BaseModel):
    advanced_mode: bool = False
    micronutrients: MicronutrientPreferenceCreate | None = None

    carbs_min: int = Field(ge=0, le=500)
    carbs_max: int = Field(ge=0, le=500)

    protein_min: int = Field(ge=0, le=400)
    protein_max: int = Field(ge=0, le=400)

    fat_min: int = Field(ge=0, le=250)
    fat_max: int = Field(ge=0, le=250)

    protein_type: str = Field(min_length=3, max_length=50)
    dietary_restriction: str = Field(min_length=3, max_length=50)
    recipe_complexity: str = Field(min_length=3, max_length=30)

    @field_validator("protein_type")
    @classmethod
    def validate_protein_type(cls, value: str) -> str:
        value = value.strip().lower()
        if value not in PROTEIN_TYPES:
            raise ValueError("Tipo de proteína inválido")
        return value

    @field_validator("dietary_restriction")
    @classmethod
    def validate_dietary_restriction(cls, value: str) -> str:
        value = value.strip().lower()
        if value not in DIETARY_RESTRICTIONS:
            raise ValueError("Restrição alimentar inválida")
        return value

    @field_validator("recipe_complexity")
    @classmethod
    def validate_recipe_complexity(cls, value: str) -> str:
        value = value.strip().lower()
        if value not in RECIPE_COMPLEXITIES:
            raise ValueError("Complexidade da receita inválida")
        return value

    @model_validator(mode="after")
    def validate_ranges(self):
        if self.carbs_min > self.carbs_max:
            raise ValueError("O mínimo de carboidratos não pode ser maior que o máximo")

        if self.protein_min > self.protein_max:
            raise ValueError("O mínimo de proteínas não pode ser maior que o máximo")

        if self.fat_min > self.fat_max:
            raise ValueError("O mínimo de gorduras não pode ser maior que o máximo")

        if self.advanced_mode and self.micronutrients is None:
            raise ValueError("Informe os micronutrientes para usar o modo avançado")

        return self


class MacroRequestResponse(BaseModel):
    id: str
    user_id: str

    carbs_min: int
    carbs_max: int

    protein_min: int
    protein_max: int

    fat_min: int
    fat_max: int

    protein_type: str
    dietary_restriction: str
    recipe_complexity: str
    advanced_mode: bool = False
    micronutrients: MicronutrientPreferenceResponse | None = None

    created_at: datetime

    model_config = {"from_attributes": True}


class RecipeResponse(BaseModel):
    id: str
    user_id: str
    macro_request_id: str | None = None

    title: str
    description: str

    ingredients: list[str]
    preparation_steps: list[str]

    carbs: int
    protein: int
    fat: int
    calories: int
    micronutrients: dict | None = None

    protein_type: str
    dietary_restriction: str
    recipe_complexity: str

    n8n_execution_id: str | None = None
    raw_ai_response: dict | None = None

    created_at: datetime

    model_config = {"from_attributes": True}


class GenerateRecipeResponse(BaseModel):
    macro_request: MacroRequestResponse
    recipe: RecipeResponse