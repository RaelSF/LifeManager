from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.shopping import (
    ShoppingItemCreate,
    ShoppingItemPurchase,
    ShoppingItemResponse,
    ShoppingItemUpdate,
)
from app.services import shopping_service

router = APIRouter(prefix="/shopping", tags=["Shopping"])


@router.get("/", response_model=List[ShoppingItemResponse])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return shopping_service.get_items(db=db, skip=skip, limit=limit)


@router.get("/active", response_model=List[ShoppingItemResponse])
def read_active_items(db: Session = Depends(get_db)):
    return shopping_service.get_active_items(db=db)


@router.post("/", response_model=ShoppingItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item: ShoppingItemCreate, db: Session = Depends(get_db)):
    return shopping_service.create_item(db=db, item=item)


@router.get("/{item_id}", response_model=ShoppingItemResponse)
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = shopping_service.get_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item de compra não encontrado.")
    return db_item


@router.patch("/{item_id}", response_model=ShoppingItemResponse)
def update_item(item_id: int, item_in: ShoppingItemUpdate, db: Session = Depends(get_db)):
    db_item = shopping_service.get_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item de compra não encontrado.")
    return shopping_service.update_item(db=db, db_item=db_item, item_in=item_in)


@router.post("/{item_id}/purchase", response_model=ShoppingItemResponse)
def mark_item_as_purchased(
    item_id: int, purchase_in: ShoppingItemPurchase, db: Session = Depends(get_db)
):
    """
    Marca o item como comprado e opcionalmente ajusta o valor unitário final do item antes disso.
    Irá criar uma Transaction no banco interligada.
    """
    db_item = shopping_service.get_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item de compra não encontrado.")
    
    if db_item.is_purchased:
        raise HTTPException(status_code=400, detail="O item já foi classificado como comprado.")
        
    return shopping_service.mark_as_purchased(db=db, db_item=db_item, purchase_in=purchase_in)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = shopping_service.get_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item de compra não encontrado.")
    shopping_service.delete_item(db=db, db_item=db_item)
