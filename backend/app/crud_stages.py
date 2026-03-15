from sqlalchemy.orm import Session
from . import models, schemas

def get_stages(db: Session):
    return db.query(models.Stage).order_by(models.Stage.order).all()

def create_stage(db: Session, stage: schemas.StageCreate):
    db_stage = models.Stage(**stage.model_dump())
    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)
    return db_stage

def update_stage(db: Session, stage_id: int, stage: schemas.StageUpdate):
    db_stage = db.query(models.Stage).filter(models.Stage.id == stage_id).first()
    if db_stage:
        for key, value in stage.model_dump(exclude_unset=True).items():
            setattr(db_stage, key, value)
        db.commit()
        db.refresh(db_stage)
    return db_stage

def delete_stage(db: Session, stage_id: int):
    db_stage = db.query(models.Stage).filter(models.Stage.id == stage_id).first()
    if db_stage:
        db.delete(db_stage)
        db.commit()
    return db_stage
