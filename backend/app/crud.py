from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional


def get_applications(db: Session) -> List[models.Application]:
    """Retrieve all applications with last event preview."""
    from sqlalchemy import text
    apps = db.query(models.Application).all()
    if not apps:
        return apps
    app_ids = [a.id for a in apps]
    rows = db.execute(
        text("""
            SELECT DISTINCT ON (application_id) application_id, content
            FROM application_info_items
            WHERE application_id = ANY(:ids)
              AND event_type IN ('transition', 'comment')
              AND content IS NOT NULL AND content != ''
            ORDER BY application_id, COALESCE(event_date, created_at) DESC
        """),
        {"ids": app_ids}
    ).fetchall()
    preview_map = {row[0]: row[1] for row in rows}
    for app in apps:
        app.last_event_preview = preview_map.get(app.id)
    return apps


def get_application(db: Session, application_id: int) -> Optional[models.Application]:
    """Retrieve a single application by ID."""
    return db.query(models.Application).filter(models.Application.id == application_id).first()


def create_application(db: Session, application: schemas.ApplicationCreate) -> models.Application:
    """Create a new application."""
    db_application = models.Application(**application.model_dump())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


def update_application(
    db: Session, 
    application_id: int, 
    application: schemas.ApplicationUpdate
) -> Optional[models.Application]:
    """Update an existing application."""
    db_application = get_application(db, application_id)
    if db_application is None:
        return None
    
    update_data = application.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_application, field, value)
    
    db.commit()
    db.refresh(db_application)
    return db_application


def delete_application(db: Session, application_id: int) -> bool:
    """Delete an application."""
    db_application = get_application(db, application_id)
    if db_application is None:
        return False
    
    db.delete(db_application)
    db.commit()
    return True
