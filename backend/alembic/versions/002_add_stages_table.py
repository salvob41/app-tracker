"""add stages table

Revision ID: 002
Revises: 001
Create Date: 2026-02-06
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Create stages table
    op.create_table(
        'stages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('key', sa.String(), nullable=False),
        sa.Column('label', sa.String(), nullable=False),
        sa.Column('color', sa.String(), nullable=False),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key')
    )
    
    # Define table for data insertion
    stages_table = table('stages',
        column('key', sa.String),
        column('label', sa.String),
        column('color', sa.String),
        column('order', sa.Integer)
    )
    
    # Insert default stages using bulk_insert which is safer
    op.bulk_insert(stages_table, [
        {'key': 'wishlist', 'label': 'Wishlist', 'color': 'gray', 'order': 1},
        {'key': 'applied', 'label': 'Applied', 'color': 'blue', 'order': 2},
        {'key': 'interview', 'label': 'Interview', 'color': 'yellow', 'order': 3},
        {'key': 'rejected', 'label': 'Rejected', 'color': 'red', 'order': 4}
    ])

def downgrade():
    op.drop_table('stages')
