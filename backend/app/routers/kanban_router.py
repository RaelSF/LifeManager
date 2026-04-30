from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.kanban import (
    KanbanBoardCreate,
    KanbanBoardResponse,
    KanbanBoardUpdate,
    KanbanCardCreate,
    KanbanCardResponse,
    KanbanCardUpdate,
)
from app.services import kanban_service

router = APIRouter(prefix="/kanban", tags=["Kanban"])


# --- Boards ---
@router.get("/boards", response_model=List[KanbanBoardResponse])
def read_boards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return kanban_service.get_boards(db=db, skip=skip, limit=limit)


@router.post("/boards", response_model=KanbanBoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(board: KanbanBoardCreate, db: Session = Depends(get_db)):
    return kanban_service.create_board(db=db, board=board)


@router.get("/boards/{board_id}", response_model=KanbanBoardResponse)
def read_board(board_id: int, db: Session = Depends(get_db)):
    db_board = kanban_service.get_board(db, board_id=board_id)
    if not db_board:
        raise HTTPException(status_code=404, detail="Quadro não encontrado.")
    return db_board


@router.patch("/boards/{board_id}", response_model=KanbanBoardResponse)
def update_board(board_id: int, board_in: KanbanBoardUpdate, db: Session = Depends(get_db)):
    db_board = kanban_service.get_board(db, board_id=board_id)
    if not db_board:
        raise HTTPException(status_code=404, detail="Quadro não encontrado.")
    return kanban_service.update_board(db=db, db_board=db_board, board_in=board_in)


@router.delete("/boards/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(board_id: int, db: Session = Depends(get_db)):
    db_board = kanban_service.get_board(db, board_id=board_id)
    if not db_board:
        raise HTTPException(status_code=404, detail="Quadro não encontrado.")
    kanban_service.delete_board(db=db, db_board=db_board)


# --- Cards ---
@router.post("/cards", response_model=KanbanCardResponse, status_code=status.HTTP_201_CREATED)
def create_card(card: KanbanCardCreate, db: Session = Depends(get_db)):
    # Opcional: garantir que board existe
    db_board = kanban_service.get_board(db, board_id=card.board_id)
    if not db_board:
        raise HTTPException(status_code=404, detail="Quadro associado não encontrado.")
    return kanban_service.create_card(db=db, card=card)


@router.patch("/cards/{card_id}", response_model=KanbanCardResponse)
def update_card(card_id: int, card_in: KanbanCardUpdate, db: Session = Depends(get_db)):
    db_card = kanban_service.get_card(db, card_id=card_id)
    if not db_card:
        raise HTTPException(status_code=404, detail="Card não encontrado.")
    return kanban_service.update_card(db=db, db_card=db_card, card_in=card_in)


@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(card_id: int, db: Session = Depends(get_db)):
    db_card = kanban_service.get_card(db, card_id=card_id)
    if not db_card:
        raise HTTPException(status_code=404, detail="Card não encontrado.")
    kanban_service.delete_card(db=db, db_card=db_card)
