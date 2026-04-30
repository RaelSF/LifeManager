from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models import TransactionType


class TransactionBase(BaseModel):
    type: TransactionType
    description: str = Field(..., max_length=500)
    amount: float = Field(..., gt=0.0)
    category: Optional[str] = Field(None, max_length=100)
    # se omitido ele usará current default
    date: Optional[datetime] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    description: Optional[str] = Field(None, max_length=500)
    amount: Optional[float] = Field(None, gt=0.0)
    category: Optional[str] = Field(None, max_length=100)
    date: Optional[datetime] = None
    is_canceled: Optional[bool] = None


class TransactionResponse(TransactionBase):
    id: int
    date: datetime
    created_at: datetime
    is_canceled: bool

    class Config:
        from_attributes = True
