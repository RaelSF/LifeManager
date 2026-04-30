from typing import List

from sqlalchemy.orm import Session

from app.models import StudyMaterial, StudySession
from app.schemas.study import StudyMaterialCreate, StudyMaterialUpdate, StudySessionCreate

# --- Materials ---

def get_materials(db: Session, skip: int = 0, limit: int = 100) -> List[StudyMaterial]:
    return db.query(StudyMaterial).offset(skip).limit(limit).all()

def get_material(db: Session, material_id: int) -> StudyMaterial | None:
    return db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()

def create_material(db: Session, material: StudyMaterialCreate) -> StudyMaterial:
    db_material = StudyMaterial(**material.model_dump())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

def update_material(db: Session, db_material: StudyMaterial, material_in: StudyMaterialUpdate) -> StudyMaterial:
    update_data = material_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_material, field, value)
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

def delete_material(db: Session, db_material: StudyMaterial) -> None:
    db.delete(db_material)
    db.commit()

# --- Sessions ---

def get_sessions(db: Session, skip: int = 0, limit: int = 100) -> List[StudySession]:
    return db.query(StudySession).offset(skip).limit(limit).order_by(StudySession.id.desc()).all()

def create_session(db: Session, session_in: StudySessionCreate) -> StudySession:
    db_session = StudySession(**session_in.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session
