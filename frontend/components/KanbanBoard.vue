<template>
  <div class="kanban-board">
    <div 
      v-for="stage in stages" 
      :key="stage.key" 
      class="kanban-column"
      @dragover.prevent
      @drop="(e) => onNativeDrop(e, stage.key)"
    >
      <div class="column-header">
        <h2 class="text-xl font-bold">{{ stage.label }}</h2>
        <UBadge :color="stage.color" variant="subtle">
          {{ (columns[stage.key] || []).length }}
        </UBadge>
      </div>

      <div class="column-body relative flex-1 min-h-0">
        <div 
          v-if="(columns[stage.key] || []).length === 0" 
          class="empty-state absolute inset-0 flex items-center justify-center text-sm text-gray-400 pointer-events-none"
        >
          No applications
        </div>

        <VueDraggable
          v-if="columns[stage.key]"
          v-model="columns[stage.key]"
          :group="{ name: 'applications' }"
          :animation="200"
          ghost-class="ghost-card"
          filter=".action-btn"
          :prevent-on-filter="false"
          class="column-content h-full overflow-y-auto"
          @change="(event) => onColumnChange(event, stage.key)"
        >
          <div
            v-for="app in columns[stage.key]"
            :key="app.id"
            class="mb-3"
          >
            <ApplicationCard 
              :application="app"
              @edit="handleEdit"
              @delete="handleDelete"
              @click="handleClick"
            />
          </div>
        </VueDraggable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { Application, Stage } from '~/types'

const props = defineProps<{
  applications: Application[]
  stages: Stage[]
}>()

const emit = defineEmits<{
  updateStage: [id: number | string, toStage: string, fromStage: string]
  edit: [application: Application]
  delete: [id: number | string]
  click: [application: Application]
}>()

// Local state for draggable columns
const columns = ref<Record<string, Application[]>>({})

// Sync local columns with props
watch(() => [props.applications, props.stages], () => {
  const currentAppMap = new Map(props.applications.map(app => [app.id, app]))
  
  // 1. Ensure all stages exist in columns
  props.stages.forEach(stage => {
    if (!columns.value[stage.key]) {
      columns.value[stage.key] = []
    }
  })

  // 2. Remove stages that no longer exist
  const stageKeys = new Set(props.stages.map(s => s.key))
  Object.keys(columns.value).forEach(key => {
    if (!stageKeys.has(key)) {
      delete columns.value[key]
    }
  })

  // 3. Update applications within columns surgically
  props.stages.forEach(stage => {
    const appsInStage = props.applications.filter(app => app.stage === stage.key)
    const currentColumn = columns.value[stage.key]

    // If lengths match and contents (ids) match in order, skip full replacement
    const idsMatch = currentColumn.length === appsInStage.length && 
                   currentColumn.every((app, i) => app.id === appsInStage[i].id)
    
    // Check if any app's data has changed (shallow check)
    const dataChanged = currentColumn.some(app => {
      const live = currentAppMap.get(app.id)
      return live && (
        live.company !== app.company ||
        live.notes !== app.notes ||
        live.stage !== app.stage ||
        live.last_event_preview !== app.last_event_preview
      )
    })

    if (!idsMatch || dataChanged) {
      columns.value[stage.key] = appsInStage
    }
  })
}, { immediate: true, deep: true })

const DRAG_DATA_KEY = 'application-tracker/app-id'

const onNativeDrop = (e: DragEvent, stageKey: string) => {
  const idStr = e.dataTransfer?.getData(DRAG_DATA_KEY)
  if (!idStr) return
  const id = idStr
  if (!id) return
  const app = props.applications.find(a => String(a.id) === id)
  if (app && app.stage !== stageKey) {
    emit('updateStage', id, stageKey, app.stage)
  }
}

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

const handleEdit = (app: Application) => {
  emit('edit', app)
}

const handleDelete = (id: number | string) => {
  emit('delete', id)
}

const handleClick = (app: Application) => {
  emit('click', app)
}
</script>

<style scoped>
.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  height: calc(100vh - 120px);
}

.kanban-column {
  display: flex;
  flex-direction: column;
  background: rgb(var(--color-gray-50));
  border-radius: 0.75rem;
  padding: 0;
  min-height: 0;
  overflow: hidden;
}

.dark .kanban-column {
  background: rgb(var(--color-gray-900));
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 2px solid rgb(var(--color-gray-200));
}

.dark .column-header {
  border-bottom-color: rgb(var(--color-gray-800));
}

.column-content {
  min-height: 100%; /* Ensure it fills the parent */
  padding: 1rem;
}

.column-content::-webkit-scrollbar {
  width: 4px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-gray-300));
  border-radius: 20px;
}

.dark .column-content::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-gray-700));
}

/* Drag Styling */
.ghost-card {
  opacity: 0.5;
  background: rgb(var(--color-gray-100));
  border: 2px dashed rgb(var(--color-gray-300));
}

.dark .ghost-card {
  background: rgb(var(--color-gray-800));
  border-color: rgb(var(--color-gray-600));
}

/* Enhancing the drop zone responsiveness */
.sortable-drag {
  cursor: grabbing;
}

@media (max-width: 768px) {
  .kanban-board {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .column-content {
    max-height: 400px;
  }
}
</style>
