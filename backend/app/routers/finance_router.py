from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.finance import TransactionCreate, TransactionResponse, TransactionUpdate
from app.services import finance_service

router = APIRouter(prefix="/transactions", tags=["Finance"])


@router.get("/", response_model=List[TransactionResponse])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return finance_service.get_transactions(db=db, skip=skip, limit=limit)


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    return finance_service.create_transaction(db=db, transaction=transaction)


@router.get("/{transaction_id}", response_model=TransactionResponse)
def read_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = finance_service.get_transaction(db, transaction_id=transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada.")
    return db_transaction


@router.patch("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int, transaction_in: TransactionUpdate, db: Session = Depends(get_db)
):
    db_transaction = finance_service.get_transaction(db, transaction_id=transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada.")
    return finance_service.update_transaction(db=db, db_transaction=db_transaction, transaction_in=transaction_in)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = finance_service.get_transaction(db, transaction_id=transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada.")
    finance_service.delete_transaction(db=db, db_transaction=db_transaction)
