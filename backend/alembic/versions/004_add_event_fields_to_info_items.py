"""add event fields to info items

Revision ID: 004
Revises: 003
Create Date: 2026-03-09

"""
from alembic import op
import sqlalchemy as sa

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('application_info_items',
        sa.Column('event_type', sa.String(20), nullable=True))
    op.add_column('application_info_items',
        sa.Column('event_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('application_info_items',
        sa.Column('from_stage', sa.String(50), nullable=True))
    op.add_column('application_info_items',
        sa.Column('to_stage', sa.String(50), nullable=True))
    op.alter_column('application_info_items', 'content', nullable=True)
    op.alter_column('application_info_items', 'tag', nullable=True)


def downgrade():
    op.alter_column('application_info_items', 'tag', nullable=False)
    op.alter_column('application_info_items', 'content', nullable=False)
    op.drop_column('application_info_items', 'to_stage')
    op.drop_column('application_info_items', 'from_stage')
    op.drop_column('application_info_items', 'event_date')
    op.drop_column('application_info_items', 'event_type')
