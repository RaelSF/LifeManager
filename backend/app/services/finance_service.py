from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Transaction
from app.schemas.finance import TransactionCreate, TransactionUpdate


def get_transactions(db: Session, skip: int = 0, limit: int = 100) -> Sequence[Transaction]:
    result = db.execute(
        select(Transaction).order_by(Transaction.date.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


def get_transaction(db: Session, transaction_id: int) -> Transaction | None:
    return db.get(Transaction, transaction_id)


def create_transaction(db: Session, transaction: TransactionCreate) -> Transaction:
    db_transaction = Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(
    db: Session, db_transaction: Transaction, transaction_in: TransactionUpdate
) -> Transaction:
    update_data = transaction_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, db_transaction: Transaction) -> None:
    db.delete(db_transaction)
    db.commit()
