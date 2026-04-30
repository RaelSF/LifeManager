from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload

from app.models import KanbanBoard, KanbanCard
from app.schemas.kanban import KanbanBoardCreate, KanbanBoardUpdate, KanbanCardCreate, KanbanCardUpdate


# --- Board ---
def get_boards(db: Session, skip: int = 0, limit: int = 100) -> Sequence[KanbanBoard]:
    result = db.execute(
        select(KanbanBoard).options(selectinload(KanbanBoard.cards)).offset(skip).limit(limit)
    )
    return result.scalars().all()


def get_board(db: Session, board_id: int) -> KanbanBoard | None:
    result = db.execute(
        select(KanbanBoard).options(selectinload(KanbanBoard.cards)).where(KanbanBoard.id == board_id)
    )
    return result.scalars().first()


def create_board(db: Session, board: KanbanBoardCreate) -> KanbanBoard:
    db_board = KanbanBoard(**board.model_dump())
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    return db_board


def update_board(db: Session, db_board: KanbanBoard, board_in: KanbanBoardUpdate) -> KanbanBoard:
    update_data = board_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_board, key, value)
    
    db.commit()
    db.refresh(db_board)
    return db_board


def delete_board(db: Session, db_board: KanbanBoard) -> None:
    db.delete(db_board)
    db.commit()


# --- Card ---
def get_cards(db: Session, board_id: int) -> Sequence[KanbanCard]:
    result = db.execute(
        select(KanbanCard).where(KanbanCard.board_id == board_id).order_by(KanbanCard.position)
    )
    return result.scalars().all()


def get_card(db: Session, card_id: int) -> KanbanCard | None:
    return db.get(KanbanCard, card_id)


def create_card(db: Session, card: KanbanCardCreate) -> KanbanCard:
    db_card = KanbanCard(**card.model_dump())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card


def update_card(db: Session, db_card: KanbanCard, card_in: KanbanCardUpdate) -> KanbanCard:
    update_data = card_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_card, key, value)
    
    db.commit()
    db.refresh(db_card)
    return db_card


def delete_card(db: Session, db_card: KanbanCard) -> None:
    db.delete(db_card)
    db.commit()
