from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class StudyMaterialBase(BaseModel):
    title: str = Field(..., max_length=255)
    link: str = Field(..., max_length=500)
    category: Optional[str] = Field(None, max_length=100)


class StudyMaterialCreate(StudyMaterialBase):
    pass


class StudyMaterialUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    link: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)


class StudyMaterialResponse(StudyMaterialBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class StudySessionBase(BaseModel):
    subject: str = Field(..., max_length=255)
    minutes: int = Field(..., gt=0)


class StudySessionCreate(StudySessionBase):
    pass


class StudySessionResponse(StudySessionBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True
