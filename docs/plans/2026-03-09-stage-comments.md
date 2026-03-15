# Stage Comments & Transition History — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Record every stage transition as an event on `info_items`, optionally attach a comment, show the last comment on the Kanban card, and display the full history in the detail view.

**Architecture:** Extend `application_info_items` with 4 new columns (`event_type`, `event_date`, `from_stage`, `to_stage`) and make `content` nullable. Classic info items are unaffected (`event_type = null`). A `last_event_preview` field is added to the list API response via a raw SQL subquery.

**Tech Stack:** FastAPI + SQLAlchemy + Alembic + PostgreSQL (via Docker), Nuxt 3 + Vue 3 + TypeScript + Nuxt UI

---

### Task 1: DB Migration 004

**Files:**
- Create: `backend/alembic/versions/004_add_event_fields_to_info_items.py`

**Step 1: Create the migration file**

```python
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
```

**Step 2: Run the migration via Docker**

```bash
docker compose exec backend alembic upgrade head
```

Expected output: `Running upgrade 003 -> 004, add event fields to info items`

**Step 3: Verify columns exist**

```bash
docker compose exec db psql -U postgres -d apptracker -c "\d application_info_items"
```

Expected: 4 new columns visible (`event_type`, `event_date`, `from_stage`, `to_stage`), `content` and `tag` now nullable.

---

### Task 2: Backend — Model & Schemas

**Files:**
- Modify: `backend/app/models.py`
- Modify: `backend/app/schemas.py`

**Step 1: Update `ApplicationInfoItem` model** (`models.py`)

Add after the `created_at` column:

```python
event_type = Column(String(20), nullable=True)   # 'transition' | 'comment' | None
event_date = Column(DateTime(timezone=True), nullable=True)
from_stage = Column(String(50), nullable=True)
to_stage = Column(String(50), nullable=True)
```

Also change `tag` and `content` to nullable:
```python
tag = Column(String(100), nullable=True)
content = Column(Text, nullable=True)
```

**Step 2: Update schemas** (`schemas.py`)

Replace `InfoItemBase`, `InfoItemCreate`, `InfoItemUpdate`, `InfoItemResponse` with:

```python
from datetime import datetime

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
```

Add `last_event_preview` to `ApplicationResponse`:

```python
class ApplicationResponse(ApplicationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_event_preview: Optional[str] = None

    class Config:
        from_attributes = True
```

**Step 3: Restart backend and check no import errors**

```bash
docker compose restart backend
docker compose logs backend --tail=20
```

Expected: no traceback, server starts on port 8000.

---

### Task 3: Backend — CRUD

**Files:**
- Modify: `backend/app/crud.py`
- Modify: `backend/app/crud_info_items.py`

**Step 1: Add `last_event_preview` to `get_applications`** (`crud.py`)

```python
from sqlalchemy import text

def get_applications(db: Session) -> List[models.Application]:
    """Retrieve all applications with last event preview."""
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
```

**Step 2: Update `create_info_item`** (`crud_info_items.py`)

Replace the function to handle new fields:

```python
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
```

**Step 3: Verify API returns `last_event_preview`**

```bash
curl http://localhost:8000/applications/ | python3 -m json.tool | grep last_event
```

Expected: `"last_event_preview": null` (or a string) per application object.

---

### Task 4: Frontend — Types

**Files:**
- Modify: `frontend/types/index.ts`

**Step 1: Update types**

```typescript
export interface Application {
    id: number
    company: string
    stage: string
    notes?: string
    created_at: string
    updated_at?: string
    last_event_preview?: string | null
}

export interface InfoItem {
    id: number
    application_id: number
    tag?: string | null
    content?: string | null
    event_type?: 'transition' | 'comment' | null
    event_date?: string | null
    from_stage?: string | null
    to_stage?: string | null
    created_at: string
}

export interface ApplicationWithInfoItems extends Application {
    info_items: InfoItem[]
}

export interface Stage {
    id: number
    key: string
    label: string
    color: string
    order: number
}

export type ApplicationCreate = Omit<Application, 'id' | 'created_at' | 'updated_at' | 'last_event_preview'>
export type ApplicationUpdate = Partial<ApplicationCreate>
export type InfoItemCreate = Omit<InfoItem, 'id' | 'application_id' | 'created_at'>
export type InfoItemUpdate = Partial<InfoItemCreate>
```

---

### Task 5: Frontend — Stage Move Flow

**Files:**
- Modify: `frontend/pages/index.vue`
- Modify: `frontend/components/KanbanBoard.vue`

**Step 1: Update `KanbanBoard.vue` to emit `fromStage`**

Change the `emit` definition and `onColumnChange` / `onNativeDrop` to pass `fromStage`:

```typescript
// In <script setup>
const emit = defineEmits<{
  updateStage: [id: number, toStage: string, fromStage: string]
  edit: [application: Application]
  delete: [id: number]
  click: [application: Application]
}>()

// onColumnChange: pass app.stage as fromStage
const onColumnChange = (event: any, stageKey: string) => {
  if (event.added) {
    const newIndex = event.added.newIndex as number
    const column = columns.value[stageKey]
    const app = column?.[newIndex] as Application | undefined
    if (app && app.stage !== stageKey) {
      emit('updateStage', app.id, stageKey, app.stage)
    }
  }
}

// onNativeDrop: pass app.stage as fromStage
const onNativeDrop = (e: DragEvent, stageKey: string) => {
  const idStr = e.dataTransfer?.getData(DRAG_DATA_KEY)
  if (!idStr) return
  const id = parseInt(idStr, 10)
  if (isNaN(id)) return
  const app = props.applications.find(a => a.id === id)
  if (app && app.stage !== stageKey) {
    emit('updateStage', id, stageKey, app.stage)
  }
}
```

**Step 2: Update `index.vue` template** — add the modal and update the event listener:

In the `<template>`, update the `@update-stage` binding:
```html
@update-stage="handleUpdateStage"
```
(same name, signature changes in the handler)

Add after `<ConfirmDeleteModal ...>`:
```html
<StageCommentModal
  v-model="showCommentModal"
  :pending-transition="pendingTransition"
  @save="handleCommentSave"
  @skip="handleCommentSkip"
/>
```

**Step 3: Update `index.vue` script** — add state and new handler:

Add imports and state:
```typescript
import type { Application, ApplicationCreate, InfoItemCreate } from '~/types'
const { createInfoItem } = useInfoItems()

const showCommentModal = ref(false)
const pendingTransition = ref<{
  appId: number
  fromStage: string
  toStage: string
  eventItemId: number | null
} | null>(null)
```

Replace `handleUpdateStage`:
```typescript
const handleUpdateStage = async (id: number, toStage: string, fromStage: string) => {
  // Optimistic update
  const index = applications.value.findIndex(a => a.id === id)
  if (index !== -1) {
    applications.value[index] = { ...applications.value[index], stage: toStage }
  }
  try {
    await updateApplication(id, { stage: toStage })
    // Auto-create transition event
    const created = await createInfoItem(id, {
      event_type: 'transition',
      from_stage: fromStage,
      to_stage: toStage,
      event_date: new Date().toISOString(),
      content: null,
      tag: null,
    })
    pendingTransition.value = {
      appId: id,
      fromStage,
      toStage,
      eventItemId: created.id,
    }
    showCommentModal.value = true
  } catch (e) {
    console.error('Failed to update stage:', e)
    await loadApplications()
  }
}

const handleCommentSave = async (comment: string) => {
  if (!pendingTransition.value?.eventItemId) return
  const { appId, eventItemId } = pendingTransition.value
  try {
    await updateInfoItem(appId, eventItemId, { content: comment })
    // Update last_event_preview on the local application object
    const idx = applications.value.findIndex(a => a.id === appId)
    if (idx !== -1) {
      applications.value[idx] = { ...applications.value[idx], last_event_preview: comment }
    }
  } finally {
    showCommentModal.value = false
    pendingTransition.value = null
  }
}

const handleCommentSkip = () => {
  showCommentModal.value = false
  pendingTransition.value = null
}
```

Also add `updateInfoItem` to the composable import:
```typescript
const { getApplications, createApplication, updateApplication, deleteApplication } = useApplications()
const { createInfoItem, updateInfoItem } = useInfoItems()
```

---

### Task 6: New Component — StageCommentModal

**Files:**
- Create: `frontend/components/StageCommentModal.vue`

**Step 1: Create the component**

```vue
<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }" :prevent-close="false">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="text-lg text-primary" />
          <h3 class="font-semibold text-base">Add a comment</h3>
        </div>
      </template>

      <div class="space-y-3">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Moved
          <UBadge :color="fromColor" variant="subtle" size="sm">{{ fromLabel }}</UBadge>
          →
          <UBadge :color="toColor" variant="subtle" size="sm">{{ toLabel }}</UBadge>
        </p>
        <UTextarea
          v-model="comment"
          placeholder="Optional comment about this transition..."
          :rows="3"
          autofocus
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="ghost" @click="skip">Skip</UButton>
          <UButton :disabled="!comment.trim()" @click="save">Save comment</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { Stage } from '~/types'

const props = defineProps<{
  modelValue: boolean
  pendingTransition: {
    appId: number
    fromStage: string
    toStage: string
    eventItemId: number | null
  } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [comment: string]
  skip: []
}>()

const { stages } = useStages()
const comment = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

watch(() => props.modelValue, (open) => {
  if (open) comment.value = ''
})

const getStage = (key: string): Stage | undefined =>
  stages.value.find(s => s.key === key)

const fromLabel = computed(() => getStage(props.pendingTransition?.fromStage ?? '')?.label ?? props.pendingTransition?.fromStage ?? '')
const toLabel = computed(() => getStage(props.pendingTransition?.toStage ?? '')?.label ?? props.pendingTransition?.toStage ?? '')
const fromColor = computed(() => getStage(props.pendingTransition?.fromStage ?? '')?.color ?? 'gray')
const toColor = computed(() => getStage(props.pendingTransition?.toStage ?? '')?.color ?? 'gray')

const save = () => emit('save', comment.value.trim())
const skip = () => emit('skip')
</script>
```

---

### Task 7: ApplicationCard — Show Last Event Preview

**Files:**
- Modify: `frontend/components/ApplicationCard.vue`

**Step 1: Replace the card-body section**

Replace the `<div class="card-body">` block (lines 43–51) with:

```html
<div class="card-body">
  <div v-if="application.last_event_preview" class="notes">
    <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="notes-icon" />
    <p class="notes-text">{{ application.last_event_preview }}</p>
  </div>
  <div v-else-if="application.notes" class="notes">
    <UIcon name="i-heroicons-document-text" class="notes-icon" />
    <p class="notes-text">{{ application.notes }}</p>
  </div>
  <div v-else class="notes-empty">
    <UIcon name="i-heroicons-document-text" class="notes-icon" />
    <p class="notes-text">No notes added</p>
  </div>
</div>
```

---

### Task 8: ApplicationDetail — Event Timeline

**Files:**
- Modify: `frontend/components/ApplicationDetail.vue`

**Step 1: Add event timeline state and computed**

In `<script setup>`, add after the existing refs:

```typescript
const showAddCommentForm = ref(false)
const newComment = ref('')
const commentLoading = ref(false)
const editingEventId = ref<number | null>(null)
const editEventDate = ref('')
const editEventContent = ref('')

const eventItems = computed(() =>
  (fullApplication.value?.info_items ?? [])
    .filter(i => i.event_type === 'transition' || i.event_type === 'comment')
    .sort((a, b) => {
      const dateA = a.event_date ?? a.created_at
      const dateB = b.event_date ?? b.created_at
      return new Date(dateA).getTime() - new Date(dateB).getTime()
    })
)
```

**Step 2: Add helper methods**

```typescript
const getStageLabel = (key: string | null | undefined) => {
  if (!key) return ''
  return stages.value.find(s => s.key === key)?.label ?? key
}

const getStageColor = (key: string | null | undefined) => {
  if (!key) return 'gray'
  return stages.value.find(s => s.key === key)?.color ?? 'gray'
}

const handleAddComment = async () => {
  if (!fullApplication.value || !newComment.value.trim()) return
  commentLoading.value = true
  try {
    const created = await createInfoItem(fullApplication.value.id, {
      event_type: 'comment',
      content: newComment.value.trim(),
      event_date: new Date().toISOString(),
      tag: null,
      from_stage: fullApplication.value.stage,
      to_stage: fullApplication.value.stage,
    })
    fullApplication.value.info_items = [...(fullApplication.value.info_items ?? []), created]
    newComment.value = ''
    showAddCommentForm.value = false
  } finally {
    commentLoading.value = false
  }
}

const startEditEvent = (item: InfoItem) => {
  editingEventId.value = item.id
  editEventDate.value = item.event_date
    ? new Date(item.event_date).toISOString().slice(0, 16)
    : new Date(item.created_at).toISOString().slice(0, 16)
  editEventContent.value = item.content ?? ''
}

const saveEditEvent = async () => {
  if (!fullApplication.value || !editingEventId.value) return
  const updated = await updateInfoItem(fullApplication.value.id, editingEventId.value, {
    content: editEventContent.value || null,
    event_date: editEventDate.value ? new Date(editEventDate.value).toISOString() : null,
  })
  const idx = fullApplication.value.info_items.findIndex(i => i.id === editingEventId.value)
  if (idx !== -1) fullApplication.value.info_items[idx] = updated
  editingEventId.value = null
}

const cancelEditEvent = () => { editingEventId.value = null }
```

Also import `updateInfoItem` from `useInfoItems`:
```typescript
const { createInfoItem, updateInfoItem, deleteInfoItem } = useInfoItems()
```

**Step 3: Add "Activity" section to template**

Add a new `detail-section` after the existing "Additional info" section and before "Timeline":

```html
<!-- Activity / Event History Section -->
<div class="detail-section">
  <div class="section-header">
    <UIcon name="i-heroicons-arrow-path" class="text-lg" />
    <h3 class="section-title">Activity</h3>
  </div>
  <div class="section-content space-y-3">
    <div v-if="!eventItems.length" class="text-gray-400 dark:text-gray-600 italic text-sm">
      No activity yet.
    </div>

    <div v-for="item in eventItems" :key="item.id" class="event-item">
      <!-- View mode -->
      <template v-if="editingEventId !== item.id">
        <div class="event-header">
          <!-- Transition badge -->
          <template v-if="item.event_type === 'transition'">
            <div class="flex items-center gap-1 flex-wrap">
              <UBadge :color="getStageColor(item.from_stage)" variant="subtle" size="sm">
                {{ getStageLabel(item.from_stage) }}
              </UBadge>
              <UIcon name="i-heroicons-arrow-right" class="text-gray-400 text-sm" />
              <UBadge :color="getStageColor(item.to_stage)" variant="subtle" size="sm">
                {{ getStageLabel(item.to_stage) }}
              </UBadge>
            </div>
          </template>
          <!-- Comment icon -->
          <template v-else>
            <div class="flex items-center gap-1">
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="text-primary text-sm" />
              <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Comment</span>
            </div>
          </template>
          <!-- Date + edit button -->
          <div class="flex items-center gap-2 ml-auto">
            <span class="text-xs text-gray-400">
              {{ formatDateTime(item.event_date ?? item.created_at) }}
            </span>
            <UButton icon="i-heroicons-pencil" size="xs" color="gray" variant="ghost"
              @click="startEditEvent(item)" />
          </div>
        </div>
        <p v-if="item.content" class="event-content">{{ item.content }}</p>
      </template>

      <!-- Edit mode -->
      <template v-else>
        <div class="space-y-2">
          <UFormGroup label="Date">
            <UInput type="datetime-local" v-model="editEventDate" />
          </UFormGroup>
          <UFormGroup label="Comment">
            <UTextarea v-model="editEventContent" :rows="2" />
          </UFormGroup>
          <div class="flex gap-2">
            <UButton size="xs" @click="saveEditEvent">Save</UButton>
            <UButton size="xs" color="gray" variant="ghost" @click="cancelEditEvent">Cancel</UButton>
          </div>
        </div>
      </template>
    </div>

    <!-- Add comment -->
    <div v-if="!showAddCommentForm" class="pt-1">
      <UButton icon="i-heroicons-plus" size="sm" color="primary" variant="soft"
        @click="showAddCommentForm = true">
        Add comment
      </UButton>
    </div>
    <div v-else class="space-y-2 pt-1">
      <UTextarea v-model="newComment" placeholder="Write a comment..." :rows="3" />
      <div class="flex gap-2">
        <UButton size="sm" :loading="commentLoading" @click="handleAddComment">Add</UButton>
        <UButton size="sm" color="gray" variant="ghost" @click="showAddCommentForm = false; newComment = ''">
          Cancel
        </UButton>
      </div>
    </div>
  </div>
</div>
```

**Step 4: Add CSS for event items** (in `<style scoped>`):

```css
.event-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgb(243, 244, 246);
  border: 1px solid rgb(229, 231, 235);
}

.dark .event-item {
  background: rgb(30, 41, 59);
  border-color: rgb(55, 65, 81);
}

.event-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.event-content {
  font-size: 0.875rem;
  color: rgb(55, 65, 81);
  margin: 0;
  white-space: pre-wrap;
}

.dark .event-content {
  color: rgb(209, 213, 219);
}
```

---

### Task 9: Final verification

**Step 1: Restart everything and open the app**

```bash
docker compose up -d
```

Open http://localhost:3000

**Step 2: Manual test checklist**

- [ ] Drag a card to a new column → comment modal appears
- [ ] Click "Skip" → transition recorded without comment, modal closes
- [ ] Drag a card again → add a comment → click "Save" → card shows the comment in the card body
- [ ] Click the card → detail modal opens → "Activity" section shows the transition(s) with correct from/to stages
- [ ] Click the pencil on an event → edit date and/or content → Save → updated in list
- [ ] Click "Add comment" in Activity → write comment → Add → appears in timeline
- [ ] Existing info items (classic notes) unaffected — still visible in "Additional info" section
