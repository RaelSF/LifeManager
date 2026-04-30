from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NoteBase(BaseModel):
    title: str = Field(default="Sem título", max_length=255)
    content: Optional[str] = None
    color: str = Field(default="#ffffff", max_length=20)
    is_pinned: bool = Field(default=False)


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    color: Optional[str] = Field(None, max_length=20)
    is_pinned: Optional[bool] = None


class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
