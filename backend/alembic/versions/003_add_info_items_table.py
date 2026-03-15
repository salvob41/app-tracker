"""add info items table

Revision ID: 003
Revises: 002
Create Date: 2026-02-14

"""
from alembic import op
import sqlalchemy as sa


revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'application_info_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=False),
        sa.Column('tag', sa.String(length=100), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_application_info_items_id', 'application_info_items', ['id'], unique=False)
    op.create_index('ix_app_info_items_app_id', 'application_info_items', ['application_id'], unique=False)


def downgrade():
    op.drop_index('ix_app_info_items_app_id', table_name='application_info_items')
    op.drop_index('ix_application_info_items_id', table_name='application_info_items')
    op.drop_table('application_info_items')
