from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload

from app.models import ShoppingItem, Transaction, TransactionType
from app.schemas.shopping import ShoppingItemCreate, ShoppingItemUpdate, ShoppingItemPurchase


def get_items(db: Session, skip: int = 0, limit: int = 100) -> Sequence[ShoppingItem]:
    result = db.execute(
        select(ShoppingItem).offset(skip).limit(limit)
    )
    return result.scalars().all()


def get_active_items(db: Session) -> Sequence[ShoppingItem]:
    """Retorna itens de compras que ainda não foram comprados."""
    result = db.execute(
        select(ShoppingItem).where(ShoppingItem.is_purchased == False)
    )
    return result.scalars().all()


def get_item(db: Session, item_id: int) -> ShoppingItem | None:
    return db.get(ShoppingItem, item_id)


def create_item(db: Session, item: ShoppingItemCreate) -> ShoppingItem:
    db_item = ShoppingItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, db_item: ShoppingItem, item_in: ShoppingItemUpdate) -> ShoppingItem:
    update_data = item_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


def mark_as_purchased(db: Session, db_item: ShoppingItem, purchase_in: ShoppingItemPurchase) -> ShoppingItem:
    """
    Integração Compras -> Financeiro.
    Marca item como comprado e gera um registro financeiro em Transactions.
    """
    if db_item.is_purchased:
        return db_item # Já comprado

    # 1. Se informou `unit_price` na compra, atualizamos o valor do item.
    if purchase_in.unit_price is not None:
        db_item.unit_price = purchase_in.unit_price

    total_value = db_item.total_price or 0.0

    now = datetime.now(timezone.utc)
    
    # 2. Gera os registros cruzados se o valor > 0
    new_transaction = None
    if total_value > 0:
        new_transaction = Transaction(
            type=TransactionType.expense,
            description=f"Compra: {db_item.name} ({db_item.quantity}x)",
            amount=total_value,
            category=db_item.category or "Mercado/Compras",
            date=now
        )
        db.add(new_transaction)
        db.flush() # obtem o ID do transaction
        
        db_item.transaction_id = new_transaction.id

    # 3. Marca item
    db_item.is_purchased = True
    db_item.purchased_at = now

    db.commit()
    
    # Refresh necessário pra limpar o state e puxar transacao atrelada
    result = db.execute(
        select(ShoppingItem)
        .options(selectinload(ShoppingItem.transaction))
        .where(ShoppingItem.id == db_item.id)
    )
    refreshed_item = result.scalars().first()
    return refreshed_item


def delete_item(db: Session, db_item: ShoppingItem) -> None:
    db.delete(db_item)
    db.commit()
