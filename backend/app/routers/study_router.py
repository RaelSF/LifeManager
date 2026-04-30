from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.study import (
    StudyMaterialCreate,
    StudyMaterialResponse,
    StudyMaterialUpdate,
    StudySessionCreate,
    StudySessionResponse,
)
from app.services import study_service

router = APIRouter(prefix="/study", tags=["Study Hub"])

# --- Materials ---

@router.get("/materials", response_model=List[StudyMaterialResponse])
def read_materials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return study_service.get_materials(db=db, skip=skip, limit=limit)

@router.post("/materials", response_model=StudyMaterialResponse, status_code=status.HTTP_201_CREATED)
def create_material(material: StudyMaterialCreate, db: Session = Depends(get_db)):
    return study_service.create_material(db=db, material=material)

@router.patch("/materials/{material_id}", response_model=StudyMaterialResponse)
def update_material(material_id: int, material_in: StudyMaterialUpdate, db: Session = Depends(get_db)):
    db_material = study_service.get_material(db, material_id=material_id)
    if not db_material:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    return study_service.update_material(db=db, db_material=db_material, material_in=material_in)

@router.delete("/materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(material_id: int, db: Session = Depends(get_db)):
    db_material = study_service.get_material(db, material_id=material_id)
    if not db_material:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    study_service.delete_material(db=db, db_material=db_material)

# --- Sessions ---

@router.get("/sessions", response_model=List[StudySessionResponse])
def read_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return study_service.get_sessions(db=db, skip=skip, limit=limit)

@router.post("/sessions", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(session: StudySessionCreate, db: Session = Depends(get_db)):
    return study_service.create_session(db=db, session_in=session)
