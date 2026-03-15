from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Application(Base):
    """Application model representing a job application."""
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(255), nullable=False)
    stage = Column(String(50), nullable=False, default="wishlist")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    info_items = relationship("ApplicationInfoItem", back_populates="application", cascade="all, delete-orphan")


class ApplicationInfoItem(Base):
    """Tagged additional info for an application (e.g. Cover letter, Portfolio)."""
    __tablename__ = "application_info_items"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    tag = Column(String(100), nullable=True)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    event_type = Column(String(20), nullable=True)   # 'transition' | 'comment' | None
    event_date = Column(DateTime(timezone=True), nullable=True)
    from_stage = Column(String(50), nullable=True)
    to_stage = Column(String(50), nullable=True)

    application = relationship("Application", back_populates="info_items")

    __table_args__ = (
        Index('ix_app_info_items_app_id', 'application_id'),
    )


class Stage(Base):
    """Stage model representing a kanban column."""
    __tablename__ = "stages"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, nullable=False, index=True)
    label = Column(String(50), nullable=False)
    color = Column(String(20), nullable=False)
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
