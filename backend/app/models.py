"""
Modelos SQLAlchemy do LifeManager.

Módulos cobertos:
  - Note          : Notas de texto rico
  - KanbanBoard   : Quadros Kanban
  - KanbanCard    : Cards/tarefas dentro de um quadro
  - Transaction   : Registros financeiros (receita ou despesa)
  - ShoppingItem  : Itens da lista de compras

Integração Compras → Financeiro:
  Quando ShoppingItem.is_purchased = True, um Transaction do tipo
  "expense" é gerado automaticamente e referenciado em
  ShoppingItem.transaction_id, mantendo rastreabilidade bidirecional.
"""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class TransactionType(str, PyEnum):
    income = "income"
    expense = "expense"


class CardStatus(str, PyEnum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class ShoppingPriority(str, PyEnum):
    low = "low"
    medium = "medium"
    high = "high"


# ---------------------------------------------------------------------------
# Note — Módulo de Notas
# ---------------------------------------------------------------------------


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Sem título")
    # Conteúdo em formato HTML (texto rico via editor no frontend)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    color: Mapped[str] = mapped_column(String(20), default="#ffffff")
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<Note id={self.id} title={self.title!r}>"


# ---------------------------------------------------------------------------
# KanbanBoard + KanbanCard — Módulo Kanban
# ---------------------------------------------------------------------------


class KanbanBoard(Base):
    __tablename__ = "kanban_boards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relacionamento: um Board possui vários Cards
    cards: Mapped[list["KanbanCard"]] = relationship(
        "KanbanCard", back_populates="board", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<KanbanBoard id={self.id} name={self.name!r}>"


class KanbanCard(Base):
    __tablename__ = "kanban_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    board_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("kanban_boards.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[CardStatus] = mapped_column(
        Enum(CardStatus), default=CardStatus.todo, nullable=False
    )
    # Posição para suportar drag-and-drop no frontend
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relacionamento: Card pertence a um Board
    board: Mapped["KanbanBoard"] = relationship("KanbanBoard", back_populates="cards")

    def __repr__(self) -> str:
        return f"<KanbanCard id={self.id} title={self.title!r} status={self.status}>"


# ---------------------------------------------------------------------------
# Transaction — Módulo Financeiro
# ---------------------------------------------------------------------------


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType), nullable=False
    )
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    is_canceled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relacionamento reverso: uma Transaction pode ter originado de um ShoppingItem
    shopping_item: Mapped["ShoppingItem | None"] = relationship(
        "ShoppingItem", back_populates="transaction", uselist=False
    )

    def __repr__(self) -> str:
        return f"<Transaction id={self.id} type={self.type} amount={self.amount}>"


# ---------------------------------------------------------------------------
# ShoppingItem — Módulo Lista de Compras
# ---------------------------------------------------------------------------


class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    priority: Mapped[ShoppingPriority] = mapped_column(
        Enum(ShoppingPriority), default=ShoppingPriority.medium, nullable=False
    )
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # --- Lógica de Integração ---
    # Quando is_purchased = True:
    #   1. O item sai da lista ativa (filtrado no serviço)
    #   2. Um registro em Transaction (type="expense") é criado
    #   3. transaction_id aponta para esse registro (rastreabilidade)
    is_purchased: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    purchased_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    transaction_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relacionamento: Item de compra → Transação gerada
    transaction: Mapped["Transaction | None"] = relationship(
        "Transaction", back_populates="shopping_item"
    )

    @property
    def total_price(self) -> float | None:
        """Valor total = quantidade × preço unitário."""
        if self.unit_price is not None:
            return self.quantity * self.unit_price
        return None

    def __repr__(self) -> str:
        return (
            f"<ShoppingItem id={self.id} name={self.name!r} "
            f"purchased={self.is_purchased}>"
        )
