<template>
  <div 
    class="application-card"
    :class="`stage-${application.stage}`"
    role="article"
    :aria-label="application.company"
    draggable="true"
    @click="$emit('click', application)"
    @dragstart="onDragStart"
  >
    <div 
      class="card-accent"
      :style="{ background: getAccentGradient(application.stage) }"
    ></div>
    <div class="card-content">
      <div class="card-header">
        <div class="company-info">
          <div class="company-icon">
            <UIcon name="i-heroicons-building-office-2" class="text-lg" />
          </div>
          <h3 class="company-name">{{ application.company }}</h3>
        </div>
        <div class="card-actions">
          <UButton 
            icon="i-heroicons-pencil" 
            size="xs" 
            color="gray" 
            variant="ghost"
            @click.stop="$emit('edit', application)"
            class="action-btn"
          />
          <UButton 
            icon="i-heroicons-trash" 
            size="xs" 
            color="red" 
            variant="ghost"
            @click.stop="$emit('delete', application.id)"
            class="action-btn"
          />
        </div>
      </div>

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

      <div class="card-footer">
        <div class="date-badge">
          <UIcon name="i-heroicons-calendar" class="date-icon" />
          <span class="date-text">{{ formatDate(application.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Application } from '~/types'

const props = defineProps<{
  application: Application
}>()

const DRAG_DATA_KEY = 'application-tracker/app-id'

const onDragStart = (e: DragEvent) => {
  e.dataTransfer?.setData(DRAG_DATA_KEY, String(props.application.id))
  e.dataTransfer && (e.dataTransfer.effectAllowed = 'move')
}

defineEmits<{
  edit: [application: Application]
  delete: [id: number | string]
  click: [application: Application]
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const { stages } = useStages()

const getAccentGradient = (stageKey: string) => {
  const stage = stages.value.find(s => s.key === stageKey)
  const color = stage?.color || 'gray'
  
  const gradients: Record<string, string> = {
    gray: 'linear-gradient(90deg, rgb(156, 163, 175), rgb(209, 213, 219))',
    blue: 'linear-gradient(90deg, rgb(59, 130, 246), rgb(96, 165, 250))',
    yellow: 'linear-gradient(90deg, rgb(234, 179, 8), rgb(250, 204, 21))',
    red: 'linear-gradient(90deg, rgb(239, 68, 68), rgb(248, 113, 113))',
    green: 'linear-gradient(90deg, rgb(34, 197, 94), rgb(74, 222, 128))',
    purple: 'linear-gradient(90deg, rgb(168, 85, 247), rgb(192, 132, 252))',
    pink: 'linear-gradient(90deg, rgb(236, 72, 153), rgb(244, 114, 182))',
    orange: 'linear-gradient(90deg, rgb(249, 115, 22), rgb(251, 146, 60))',
    teal: 'linear-gradient(90deg, rgb(20, 184, 166), rgb(45, 212, 191))'
  }
  
  return gradients[color] || gradients['gray']
}
</script>

<style scoped>
.application-card {
  position: relative;
  background: white;
  border-radius: 12px;
  border: 2px solid rgb(229, 231, 235);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.dark .application-card {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
}

.application-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: rgb(59, 130, 246);
}

.application-card:active {
  cursor: grabbing;
  transform: translateY(-2px) scale(0.98);
}

/* Stage-specific accent colors */
.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, rgb(156, 163, 175), rgb(209, 213, 219)); /* Default gray */
  /* Dynamic color is set via style attribute */
}

.card-content {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.company-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgb(239, 246, 255), rgb(219, 234, 254));
  border-radius: 8px;
  color: rgb(59, 130, 246);
}

.dark .company-icon {
  background: linear-gradient(135deg, rgb(30, 58, 138), rgb(29, 78, 216));
  color: rgb(147, 197, 253);
}

.company-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(17, 24, 39);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .company-name {
  color: rgb(243, 244, 246);
}

.card-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.application-card:hover .action-btn {
  opacity: 1;
}

.card-body {
  margin-bottom: 12px;
}

.notes,
.notes-empty {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px;
  background: rgb(249, 250, 251);
  border-radius: 8px;
  border: 1px solid rgb(229, 231, 235);
}

.dark .notes,
.dark .notes-empty {
  background: rgb(17, 24, 39);
  border-color: rgb(55, 65, 81);
}

.notes-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: rgb(107, 114, 128);
}

.dark .notes-icon {
  color: rgb(156, 163, 175);
}

.notes-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgb(55, 65, 81);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dark .notes-text {
  color: rgb(209, 213, 219);
}

.notes-empty .notes-text {
  color: rgb(156, 163, 175);
  font-style: italic;
}

.dark .notes-empty .notes-text {
  color: rgb(107, 114, 128);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgb(243, 244, 246);
  border-radius: 6px;
  border: 1px solid rgb(229, 231, 235);
}

.dark .date-badge {
  background: rgb(55, 65, 81);
  border-color: rgb(75, 85, 99);
}

.date-icon {
  font-size: 0.875rem;
  color: rgb(107, 114, 128);
}

.dark .date-icon {
  color: rgb(156, 163, 175);
}

.date-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(75, 85, 99);
  letter-spacing: 0.025em;
}

.dark .date-text {
  color: rgb(156, 163, 175);
}
</style>

