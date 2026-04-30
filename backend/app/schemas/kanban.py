from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models import CardStatus


# --- KanbanCard Schemas ---
class KanbanCardBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: CardStatus = Field(default=CardStatus.todo)
    position: int = Field(default=0)
    due_date: Optional[datetime] = None


class KanbanCardCreate(KanbanCardBase):
    board_id: int


class KanbanCardUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[CardStatus] = None
    position: Optional[int] = None
    due_date: Optional[datetime] = None


class KanbanCardResponse(KanbanCardBase):
    id: int
    board_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- KanbanBoard Schemas ---
class KanbanBoardBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=500)


class KanbanBoardCreate(KanbanBoardBase):
    pass


class KanbanBoardUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=500)


class KanbanBoardResponse(KanbanBoardBase):
    id: int
    created_at: datetime
    # Retorna as cards conectadas na reposta do Board
    cards: List[KanbanCardResponse] = []

    class Config:
        from_attributes = True
