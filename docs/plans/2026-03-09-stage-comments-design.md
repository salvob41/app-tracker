# Stage Comments & Transition History — Design

**Date**: 2026-03-09

## Summary

Extend the existing `info_items` system to track stage transitions and free-form comments on applications. Each card move is automatically recorded; users can optionally attach text. A unified timeline appears in the detail view; the Kanban card shows the last comment.

## Data Model

Extend `application_info_items` with 4 new nullable columns:

| Field | Type | Description |
|---|---|---|
| `event_type` | `string` nullable | `"transition"` \| `"comment"` \| null (existing items) |
| `event_date` | `datetime` nullable | user-editable date; defaults to `created_at` |
| `from_stage` | `string` nullable | set only for `transition` events |
| `to_stage` | `string` nullable | set only for `transition` events |

Existing info items (tag + content) are unaffected: `event_type = null`.

## Backend Changes

1. **Migration**: add 4 columns to `application_info_items`
2. **Schema** (`InfoItemCreate`, `InfoItemUpdate`, `InfoItem`): add new fields
3. **CRUD**: no logic changes needed — fields are pass-through
4. **API**: existing `POST/PUT /info_items` endpoints are sufficient

## Frontend Changes

### On card move (KanbanBoard.vue + index.vue)
- After `updateStage` succeeds, auto-create an info_item:
  `{ event_type: "transition", from_stage, to_stage, event_date: now, content: "" }`
- Show a small modal: "Vuoi aggiungere un commento?" with a text field + **Salva** / **Salta**
- On save: update the just-created item's `content`

### Kanban card (ApplicationCard.vue)
- Show `content` of the last item where `event_type IN ["transition", "comment"]` and `content` is non-empty
- If none → no change from current behavior

### Detail view (ApplicationDetail.vue)
- Unified timeline sorted by `event_date` (or `created_at` as fallback)
- Transition items: badge `Stage X → Stage Y` + optional text + editable date
- Comment items: message icon + text + date
- Classic info items: existing rendering (tag + content)
- Actions: add comment button, edit text/date on transitions and comments

### Types (types/index.ts)
```typescript
interface InfoItem {
  id: number
  application_id: number
  tag: string
  content: string
  event_type?: 'transition' | 'comment' | null
  event_date?: string | null
  from_stage?: string | null
  to_stage?: string | null
  created_at: string
}
```

## UX Notes
- The "add comment" modal after a move is optional — user can skip
- Comments can always be added later from the detail view
- Transition dates are editable (click on date in timeline)
- Comments are editable from the detail view
