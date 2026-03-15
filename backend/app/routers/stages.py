from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud_stages, schemas
from ..database import get_db

router = APIRouter(prefix="/stages", tags=["stages"])

@router.get("/", response_model=List[schemas.StageResponse])
def list_stages(db: Session = Depends(get_db)):
    return crud_stages.get_stages(db)

@router.post("/", response_model=schemas.StageResponse, status_code=201)
def create_stage(stage: schemas.StageCreate, db: Session = Depends(get_db)):
    return crud_stages.create_stage(db, stage)

@router.patch("/{stage_id}", response_model=schemas.StageResponse)
def update_stage(stage_id: int, stage: schemas.StageUpdate, db: Session = Depends(get_db)):
    db_stage = crud_stages.update_stage(db, stage_id, stage)
    if not db_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return db_stage

@router.delete("/{stage_id}", status_code=204)
def delete_stage(stage_id: int, db: Session = Depends(get_db)):
    db_stage = crud_stages.delete_stage(db, stage_id)
    if not db_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
