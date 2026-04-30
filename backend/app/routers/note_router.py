from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate
from app.services import note_service

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("/", response_model=List[NoteResponse])
def read_notes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return note_service.get_notes(db=db, skip=skip, limit=limit)


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    return note_service.create_note(db=db, note=note)


@router.get("/{note_id}", response_model=NoteResponse)
def read_note(note_id: int, db: Session = Depends(get_db)):
    db_note = note_service.get_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Nota não encontrada.")
    return db_note


@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_in: NoteUpdate, db: Session = Depends(get_db)):
    db_note = note_service.get_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Nota não encontrada.")
    return note_service.update_note(db=db, db_note=db_note, note_in=note_in)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = note_service.get_note(db, note_id=note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Nota não encontrada.")
    note_service.delete_note(db=db, db_note=db_note)
