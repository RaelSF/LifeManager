from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models import ShoppingPriority


class ShoppingItemBase(BaseModel):
    name: str = Field(..., max_length=255)
    quantity: int = Field(default=1, gt=0)
    unit_price: Optional[float] = Field(None, ge=0.0)
    priority: ShoppingPriority = Field(default=ShoppingPriority.medium)
    category: Optional[str] = Field(None, max_length=100)


class ShoppingItemCreate(ShoppingItemBase):
    pass


class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    quantity: Optional[int] = Field(None, gt=0)
    unit_price: Optional[float] = Field(None, ge=0.0)
    priority: Optional[ShoppingPriority] = None
    category: Optional[str] = Field(None, max_length=100)


class ShoppingItemPurchase(BaseModel):
    """Schema para a ação de marcar como comprado, recebendo o valor unitário opcionalmente que sobrescreve o valor do item."""
    unit_price: Optional[float] = Field(None, ge=0.0)


class ShoppingItemResponse(ShoppingItemBase):
    id: int
    is_purchased: bool
    purchased_at: Optional[datetime]
    transaction_id: Optional[int]
    total_price: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True
