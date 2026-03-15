from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud
from .. import crud_info_items
from .. import schemas
from ..database import get_db

router = APIRouter(prefix="/applications/{application_id}/info-items", tags=["info-items"])


@router.get("/", response_model=List[schemas.InfoItemResponse])
def list_info_items(application_id: int, db: Session = Depends(get_db)):
    """Get all info items for an application."""
    if crud.get_application(db, application_id) is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return crud_info_items.get_info_items(db, application_id)


@router.post("/", response_model=schemas.InfoItemResponse, status_code=status.HTTP_201_CREATED)
def create_info_item(
    application_id: int,
    item: schemas.InfoItemCreate,
    db: Session = Depends(get_db)
):
    """Add a tagged info item to an application."""
    if crud.get_application(db, application_id) is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return crud_info_items.create_info_item(db, application_id, item)


@router.put("/{item_id}", response_model=schemas.InfoItemResponse)
def update_info_item(
    application_id: int,
    item_id: int,
    item: schemas.InfoItemUpdate,
    db: Session = Depends(get_db)
):
    """Update an info item."""
    updated = crud_info_items.update_info_item(db, item_id, application_id, item)
    if updated is None:
        raise HTTPException(status_code=404, detail="Info item not found")
    return updated


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_info_item(
    application_id: int,
    item_id: int,
    db: Session = Depends(get_db)
):
    """Delete an info item."""
    if not crud_info_items.delete_info_item(db, item_id, application_id):
        raise HTTPException(status_code=404, detail="Info item not found")
