from sqlalchemy.orm import Session
from . import models, schemas


def get_info_items(db: Session, application_id: int):
    return db.query(models.ApplicationInfoItem).filter(
        models.ApplicationInfoItem.application_id == application_id
    ).order_by(models.ApplicationInfoItem.created_at).all()


def create_info_item(db: Session, application_id: int, item: schemas.InfoItemCreate):
    db_item = models.ApplicationInfoItem(
        application_id=application_id,
        tag=item.tag,
        content=item.content,
        event_type=item.event_type,
        event_date=item.event_date,
        from_stage=item.from_stage,
        to_stage=item.to_stage,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_info_item(
    db: Session,
    item_id: int,
    application_id: int,
    item: schemas.InfoItemUpdate
):
    db_item = db.query(models.ApplicationInfoItem).filter(
        models.ApplicationInfoItem.id == item_id,
        models.ApplicationInfoItem.application_id == application_id
    ).first()
    if not db_item:
        return None
    update_data = item.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_info_item(db: Session, item_id: int, application_id: int) -> bool:
    db_item = db.query(models.ApplicationInfoItem).filter(
        models.ApplicationInfoItem.id == item_id,
        models.ApplicationInfoItem.application_id == application_id
    ).first()
    if not db_item:
        return False
    db.delete(db_item)
    db.commit()
    return True
