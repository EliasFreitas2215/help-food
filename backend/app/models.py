import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    cpf: Mapped[str | None] = mapped_column(
        String(14),
        unique=True,
        index=True,
        nullable=True,
    )

    address_line1: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    address_line2: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    state: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    postal_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    verification_token: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
        index=True,
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class MacroRequest(Base):
    __tablename__ = "macro_requests"

    __table_args__ = (
        CheckConstraint(
            "carbs_min <= carbs_max",
            name="ck_macro_carbs_range",
        ),
        CheckConstraint(
            "protein_min <= protein_max",
            name="ck_macro_protein_range",
        ),
        CheckConstraint(
            "fat_min <= fat_max",
            name="ck_macro_fat_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    carbs_min: Mapped[int] = mapped_column(nullable=False)
    carbs_max: Mapped[int] = mapped_column(nullable=False)

    protein_min: Mapped[int] = mapped_column(nullable=False)
    protein_max: Mapped[int] = mapped_column(nullable=False)

    fat_min: Mapped[int] = mapped_column(nullable=False)
    fat_max: Mapped[int] = mapped_column(nullable=False)

    protein_type: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    dietary_restriction: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    recipe_complexity: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    advanced_mode: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class MicronutrientPreference(Base):
    __tablename__ = "micronutrient_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    macro_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("macro_requests.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    vitamin_a: Mapped[int | None] = mapped_column(Integer, nullable=True)
    vitamin_c: Mapped[int | None] = mapped_column(Integer, nullable=True)
    vitamin_d: Mapped[int | None] = mapped_column(Integer, nullable=True)
    vitamin_e: Mapped[int | None] = mapped_column(Integer, nullable=True)
    vitamin_b12: Mapped[int | None] = mapped_column(Integer, nullable=True)
    calcium: Mapped[int | None] = mapped_column(Integer, nullable=True)
    iron: Mapped[int | None] = mapped_column(Integer, nullable=True)
    magnesium: Mapped[int | None] = mapped_column(Integer, nullable=True)
    potassium: Mapped[int | None] = mapped_column(Integer, nullable=True)
    zinc: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    macro_request_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("macro_requests.id", ondelete="SET NULL"),
        nullable=True,
    )

    title: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    ingredients: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    preparation_steps: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    carbs: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    protein: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    fat: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    calories: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    micronutrients: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    protein_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    dietary_restriction: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    recipe_complexity: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    n8n_execution_id: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    raw_ai_response: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )