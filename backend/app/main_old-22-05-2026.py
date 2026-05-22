import uuid

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import (
    create_access_token,
    create_verification_token,
    hash_password,
    require_auth,
    verify_password,
)
from .config import settings
from .db import get_db
from .email_service import send_verification_email
from .models import MacroRequest, MicronutrientPreference, Recipe, User
from .recipe_service import call_n8n_recipe_webhook, validate_recipe_response
from .schemas import (
    AuthResponse,
    GenerateRecipeResponse,
    LoginRequest,
    MacroRequestCreate,
    MacroRequestResponse,
    MicronutrientPreferenceResponse,
    RecipeResponse,
    RegisterRequest,
)

app = FastAPI(title="Help Food API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    if payload.cpf:
        existing_cpf = db.scalar(select(User).where(User.cpf == payload.cpf))
        if existing_cpf:
            raise HTTPException(status_code=400, detail="CPF já cadastrado")

    token = create_verification_token()
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        is_verified=False,
        verification_token=token,
        cpf=payload.cpf,
        address_line1=payload.address_line1,
        address_line2=payload.address_line2,
        city=payload.city,
        state=payload.state,
        postal_code=payload.postal_code,
        country=payload.country,
    )

    db.add(user)
    db.commit()

    verify_link = f"{settings.APP_BASE_URL}/verify/{token}"

    try:
        send_verification_email(payload.email, verify_link)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Usuário criado, mas falhou ao enviar e-mail",
        ) from exc

    return {"message": "Usuário criado. Verifique seu e-mail para ativar a conta."}


@app.get("/verify/{token}")
def verify_account(token: str, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.verification_token == token))
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido")

    user.is_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "Conta verificada com sucesso. Você já pode fazer login."}


@app.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Conta não verificada. Confirme seu e-mail.",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_access_token(subject=user.id)
    return AuthResponse(access_token=token)


@app.get("/me")
def me(user_id: str = Depends(require_auth), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "cpf": user.cpf,
        "address": {
            "address_line1": user.address_line1,
            "address_line2": user.address_line2,
            "city": user.city,
            "state": user.state,
            "postal_code": user.postal_code,
            "country": user.country,
        },
    }


def _serialize_micronutrient_preference(preference: MicronutrientPreference | None) -> dict | None:
    if not preference:
        return None

    return {
        "id": str(preference.id),
        "user_id": str(preference.user_id),
        "macro_request_id": str(preference.macro_request_id),
        "vitamin_a": preference.vitamin_a,
        "vitamin_c": preference.vitamin_c,
        "vitamin_d": preference.vitamin_d,
        "vitamin_e": preference.vitamin_e,
        "vitamin_b12": preference.vitamin_b12,
        "calcium": preference.calcium,
        "iron": preference.iron,
        "magnesium": preference.magnesium,
        "potassium": preference.potassium,
        "zinc": preference.zinc,
        "created_at": preference.created_at,
    }


def _get_micronutrient_preference(db: Session, macro_request_id: uuid.UUID) -> MicronutrientPreference | None:
    return db.scalar(
        select(MicronutrientPreference).where(
            MicronutrientPreference.macro_request_id == macro_request_id
        )
    )


def _serialize_macro_request(macro_request: MacroRequest, db: Session | None = None) -> dict:
    micronutrients = _serialize_micronutrient_preference(
        _get_micronutrient_preference(db, macro_request.id) if db else None
    )

    return {
        "id": str(macro_request.id),
        "user_id": str(macro_request.user_id),
        "carbs_min": macro_request.carbs_min,
        "carbs_max": macro_request.carbs_max,
        "protein_min": macro_request.protein_min,
        "protein_max": macro_request.protein_max,
        "fat_min": macro_request.fat_min,
        "fat_max": macro_request.fat_max,
        "protein_type": macro_request.protein_type,
        "dietary_restriction": macro_request.dietary_restriction,
        "recipe_complexity": macro_request.recipe_complexity,
        "advanced_mode": bool(macro_request.advanced_mode),
        "micronutrients": micronutrients,
        "created_at": macro_request.created_at,
    }


def _serialize_recipe(recipe: Recipe) -> dict:
    return {
        "id": str(recipe.id),
        "user_id": str(recipe.user_id),
        "macro_request_id": str(recipe.macro_request_id)
        if recipe.macro_request_id
        else None,
        "title": recipe.title,
        "description": recipe.description,
        "ingredients": recipe.ingredients or [],
        "preparation_steps": recipe.preparation_steps or [],
        "carbs": recipe.carbs,
        "protein": recipe.protein,
        "fat": recipe.fat,
        "calories": recipe.calories,
        "micronutrients": recipe.micronutrients,
        "protein_type": recipe.protein_type,
        "dietary_restriction": recipe.dietary_restriction,
        "recipe_complexity": recipe.recipe_complexity,
        "n8n_execution_id": recipe.n8n_execution_id,
        "raw_ai_response": recipe.raw_ai_response,
        "created_at": recipe.created_at,
    }


def _create_macro_request_record(
    payload: MacroRequestCreate,
    user_id: str,
    db: Session,
) -> MacroRequest:
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="ID do usuário inválido para salvar metas",
        ) from exc

    macro_data = payload.model_dump(exclude={"micronutrients"})
    macro_request = MacroRequest(user_id=user_uuid, **macro_data)
    db.add(macro_request)
    db.flush()

    if payload.advanced_mode and payload.micronutrients:
        preference = MicronutrientPreference(
            user_id=user_id,
            macro_request_id=macro_request.id,
            **payload.micronutrients.clean_values(),
        )
        db.add(preference)

    db.commit()
    db.refresh(macro_request)

    return macro_request


@app.post("/macro-request", response_model=MacroRequestResponse, status_code=201)
def create_macro_request(
    payload: MacroRequestCreate,
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db),
):
    macro_request = _create_macro_request_record(payload, user_id, db)
    return _serialize_macro_request(macro_request, db)


@app.get("/macro-request/me/latest", response_model=MacroRequestResponse)
def get_latest_macro_request(
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db),
):
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="ID do usuário inválido para consultar metas",
        ) from exc

    stmt = (
        select(MacroRequest)
        .where(MacroRequest.user_id == user_uuid)
        .order_by(MacroRequest.created_at.desc())
    )

    macro_request = db.scalar(stmt)

    if not macro_request:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma meta nutricional encontrada",
        )

    return _serialize_macro_request(macro_request, db)


@app.post("/recipes/generate", response_model=GenerateRecipeResponse, status_code=201)
def generate_recipe(
    payload: MacroRequestCreate,
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db),
):
    macro_request = _create_macro_request_record(payload, user_id, db)

    ai_response = call_n8n_recipe_webhook(
        payload,
        user_id,
        str(macro_request.id),
    )

    recipe_data = validate_recipe_response(ai_response)

    recipe = Recipe(
        user_id=user_id,
        macro_request_id=macro_request.id,
        title=recipe_data["title"],
        description=recipe_data["description"],
        ingredients=recipe_data["ingredients"],
        preparation_steps=recipe_data["preparation_steps"],
        carbs=recipe_data["carbs"],
        protein=recipe_data["protein"],
        fat=recipe_data["fat"],
        calories=recipe_data["calories"],
        micronutrients=recipe_data.get("micronutrients"),
        protein_type=payload.protein_type,
        dietary_restriction=payload.dietary_restriction,
        recipe_complexity=payload.recipe_complexity,
        n8n_execution_id=recipe_data.get("n8n_execution_id"),
        raw_ai_response=ai_response,
    )

    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    return {
        "macro_request": _serialize_macro_request(macro_request, db),
        "recipe": _serialize_recipe(recipe),
    }


@app.get("/recipes", response_model=list[RecipeResponse])
def list_recipes(
    user_id: str = Depends(require_auth),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Recipe)
        .where(Recipe.user_id == user_id)
        .order_by(Recipe.created_at.desc())
    )

    recipes = db.scalars(stmt).all()

    return [_serialize_recipe(recipe) for recipe in recipes]