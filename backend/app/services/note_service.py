from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Note
from app.schemas.note import NoteCreate, NoteUpdate


def get_notes(db: Session, skip: int = 0, limit: int = 100) -> Sequence[Note]:
    result = db.execute(select(Note).offset(skip).limit(limit))
    return result.scalars().all()


def get_note(db: Session, note_id: int) -> Note | None:
    return db.get(Note, note_id)


def create_note(db: Session, note: NoteCreate) -> Note:
    db_note = Note(**note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_note(db: Session, db_note: Note, note_in: NoteUpdate) -> Note:
    update_data = note_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    
    db.commit()
    db.refresh(db_note)
    return db_note


def delete_note(db: Session, db_note: Note) -> None:
    db.delete(db_note)
    db.commit()
