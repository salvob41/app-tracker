from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class ApplicationBase(BaseModel):
    """Base schema for application data."""
    company: str = Field(..., min_length=1, max_length=255)
    stage: str = Field(default="wishlist")
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    """Schema for creating a new application."""
    pass


class ApplicationUpdate(BaseModel):
    """Schema for updating an application."""
    company: Optional[str] = Field(None, min_length=1, max_length=255)
    stage: Optional[str] = None
    notes: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    """Schema for application response."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_event_preview: Optional[str] = None

    class Config:
        from_attributes = True


class ApplicationDetailResponse(ApplicationResponse):
    """Application with nested info items."""
    info_items: List["InfoItemResponse"] = []

    class Config:
        from_attributes = True


class StageBase(BaseModel):
    key: str
    label: str
    color: str
    order: int

class StageCreate(StageBase):
    pass

class StageUpdate(BaseModel):
    label: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None

class StageResponse(StageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class InfoItemBase(BaseModel):
    tag: Optional[str] = Field(None, max_length=100)
    content: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime] = None
    from_stage: Optional[str] = None
    to_stage: Optional[str] = None


class InfoItemCreate(InfoItemBase):
    pass


class InfoItemUpdate(InfoItemBase):
    pass


class InfoItemResponse(InfoItemBase):
    id: int
    application_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Rebuild models to resolve forward references
ApplicationDetailResponse.model_rebuild()


