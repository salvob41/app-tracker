from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("/", response_model=List[schemas.ApplicationResponse])
def list_applications(db: Session = Depends(get_db)):
    """Get all applications."""
    return crud.get_applications(db)


@router.get("/{application_id}", response_model=schemas.ApplicationDetailResponse)
def get_application(application_id: int, db: Session = Depends(get_db)):
    """Get a specific application by ID with info items."""
    application = crud.get_application(db, application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return application


@router.post("/", response_model=schemas.ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    """Create a new application."""
    return crud.create_application(db, application)


@router.put("/{application_id}", response_model=schemas.ApplicationResponse)
def update_application(
    application_id: int,
    application: schemas.ApplicationUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing application."""
    updated_application = crud.update_application(db, application_id, application)
    if updated_application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return updated_application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: int, db: Session = Depends(get_db)):
    """Delete an application."""
    success = crud.delete_application(db, application_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
