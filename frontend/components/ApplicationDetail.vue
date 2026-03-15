<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard v-if="application">
      <template #header>
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="company-icon-large">
              <UIcon name="i-heroicons-building-office-2" class="text-2xl" />
            </div>
            <div>
              <h2 class="text-2xl font-bold">{{ application.company }}</h2>
              <UBadge 
                :color="getStageColor(application.stage)" 
                variant="subtle"
                size="lg"
                class="mt-1"
              >
                {{ getStageLabel(application.stage) }}
              </UBadge>
            </div>
          </div>
          <div class="flex gap-2">
            <UButton 
              icon="i-heroicons-pencil" 
              color="gray" 
              variant="ghost"
              @click="handleEdit"
            >
              Edit
            </UButton>
            <UButton 
              icon="i-heroicons-x-mark" 
              color="gray" 
              variant="ghost"
              @click="closeModal"
            />
          </div>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Notes Section -->
        <div class="detail-section">
          <div class="section-header">
            <UIcon name="i-heroicons-document-text" class="text-lg" />
            <h3 class="section-title">Notes</h3>
          </div>
          <div class="section-content">
            <p v-if="application.notes" class="notes-content">
              {{ application.notes }}
            </p>
            <p v-else class="text-gray-400 dark:text-gray-600 italic">
              No notes added yet
            </p>
          </div>
        </div>

        <!-- Tagged Additional Info Section -->
        <div class="detail-section">
          <div class="section-header">
            <UIcon name="i-heroicons-clipboard-document-list" class="text-lg" />
            <h3 class="section-title">Additional info</h3>
          </div>
          <div class="section-content space-y-4">
            <div
              v-for="item in (fullApplication?.info_items ?? []).filter(i => !i.event_type || (i.event_type !== 'transition' && i.event_type !== 'comment'))"
              :key="item.id"
              class="info-item-block"
            >
              <div class="info-item-header">
                <UBadge color="primary" variant="soft" size="sm">{{ item.tag }}</UBadge>
                <div class="info-item-actions">
                  <UButton
                    icon="i-heroicons-pencil"
                    size="xs"
                    color="gray"
                    variant="ghost"
                    @click="openEditItem(item)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    size="xs"
                    color="red"
                    variant="ghost"
                    @click="handleDeleteItem(item.id)"
                  />
                </div>
              </div>
              <p class="info-item-content">{{ item.content }}</p>
            </div>
            <div v-if="!(fullApplication?.info_items ?? []).filter(i => !i.event_type || (i.event_type !== 'transition' && i.event_type !== 'comment')).length" class="text-gray-400 dark:text-gray-600 italic">
              No additional info yet. Add a tagged item below.
            </div>
            <!-- Add new item form -->
            <div v-if="!showAddForm" class="pt-2">
              <UButton
                icon="i-heroicons-plus"
                size="sm"
                color="primary"
                variant="soft"
                @click="showAddForm = true"
              >
                Add tagged info
              </UButton>
            </div>
            <div v-else class="add-item-form pt-2 space-y-3">
              <UFormGroup label="Tag" required>
                <UInput
                  v-model="newItem.tag"
                  placeholder="e.g. Cover letter, Portfolio, Key points"
                />
              </UFormGroup>
              <UFormGroup label="Content" required>
                <UTextarea
                  v-model="newItem.content"
                  placeholder="Paste your content here..."
                  :rows="4"
                />
              </UFormGroup>
              <div class="flex gap-2">
                <UButton size="sm" :loading="addLoading" @click="handleAddItem">
                  {{ editingItemId ? 'Update' : 'Add' }}
                </UButton>
                <UButton size="sm" color="gray" variant="ghost" @click="cancelAdd">
                  Cancel
                </UButton>
              </div>
            </div>
          </div>
        </div>

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

        <!-- Timeline Section -->
        <div class="detail-section">
          <div class="section-header">
            <UIcon name="i-heroicons-clock" class="text-lg" />
            <h3 class="section-title">Timeline</h3>
          </div>
          <div class="section-content">
            <div class="timeline-item">
              <div class="timeline-label">Created</div>
              <div class="timeline-value">
                {{ formatDateTime(application.created_at) }}
              </div>
            </div>
            <div v-if="application.updated_at" class="timeline-item">
              <div class="timeline-label">Last Updated</div>
              <div class="timeline-value">
                {{ formatDateTime(application.updated_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata Section -->
        <div class="detail-section">
          <div class="section-header">
            <UIcon name="i-heroicons-information-circle" class="text-lg" />
            <h3 class="section-title">Details</h3>
          </div>
          <div class="section-content">
            <div class="metadata-grid">
              <div class="metadata-item">
                <div class="metadata-label">Application ID</div>
                <div class="metadata-value">#{{ application.id }}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">Current Stage</div>
                <div class="metadata-value">{{ getStageLabel(application.stage) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <UButton 
            color="red" 
            variant="ghost"
            icon="i-heroicons-trash"
            @click="handleDelete"
          >
            Delete Application
          </UButton>
          <UButton 
            color="gray"
            @click="closeModal"
          >
            Close
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { Application, ApplicationWithInfoItems, InfoItem, Stage } from '~/types'

const props = defineProps<{
  modelValue: boolean
  application?: Application
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: [application: Application]
  delete: [id: number]
}>()

const { stages } = useStages()
const { getApplication } = useApplications()
const { createInfoItem, updateInfoItem, deleteInfoItem } = useInfoItems()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const fullApplication = ref<ApplicationWithInfoItems | null>(null)
const showAddForm = ref(false)
const editingItemId = ref<number | null>(null)
const newItem = ref({ tag: '', content: '' })
const addLoading = ref(false)

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

watch([() => props.modelValue, () => props.application], async ([open, app]) => {
  if (open && app) {
    try {
      fullApplication.value = await getApplication(app.id) as ApplicationWithInfoItems
    } catch {
      fullApplication.value = null
    }
    showAddForm.value = false
    editingItemId.value = null
    newItem.value = { tag: '', content: '' }
  } else {
    fullApplication.value = null
  }
}, { immediate: true })

const application = computed(() => props.application ?? fullApplication.value)

const getStageColor = (stageKey: string) => {
  const stageConfig = stages.value.find(s => s.key === stageKey)
  return stageConfig?.color || 'gray'
}

const getStageLabel = (stageKey: string) => {
  const stageConfig = stages.value.find(s => s.key === stageKey)
  return stageConfig?.label || stageKey
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openEditItem = (item: InfoItem) => {
  editingItemId.value = item.id
  newItem.value = { tag: item.tag, content: item.content }
  showAddForm.value = true
}

const cancelAdd = () => {
  showAddForm.value = false
  editingItemId.value = null
  newItem.value = { tag: '', content: '' }
}

const handleAddItem = async () => {
  if (!fullApplication.value || (!newItem.value.tag.trim() || !newItem.value.content.trim())) return
  addLoading.value = true
  try {
    if (editingItemId.value) {
      const updated = await updateInfoItem(
        fullApplication.value.id,
        editingItemId.value,
        newItem.value
      )
      const idx = fullApplication.value.info_items.findIndex(i => i.id === editingItemId.value)
      if (idx !== -1) fullApplication.value.info_items[idx] = updated
    } else {
      const created = await createInfoItem(fullApplication.value.id, newItem.value)
      fullApplication.value.info_items = [...(fullApplication.value.info_items || []), created]
    }
    cancelAdd()
  } finally {
    addLoading.value = false
  }
}

const handleDeleteItem = async (itemId: number) => {
  if (!fullApplication.value || !confirm('Delete this item?')) return
  await deleteInfoItem(fullApplication.value.id, itemId)
  fullApplication.value.info_items = fullApplication.value.info_items.filter(i => i.id !== itemId)
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

const handleEdit = () => {
  if (props.application) {
    emit('edit', props.application)
    closeModal()
  }
}

const handleDelete = () => {
  if (props.application && confirm('Are you sure you want to delete this application?')) {
    emit('delete', props.application.id)
    closeModal()
  }
}

const closeModal = () => {
  isOpen.value = false
}
</script>

<style scoped>
.company-icon-large {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgb(239, 246, 255), rgb(219, 234, 254));
  border-radius: 12px;
  color: rgb(59, 130, 246);
}

.dark .company-icon-large {
  background: linear-gradient(135deg, rgb(30, 58, 138), rgb(29, 78, 216));
  color: rgb(147, 197, 253);
}

.detail-section {
  padding: 16px;
  background: rgb(249, 250, 251);
  border-radius: 12px;
  border: 1px solid rgb(229, 231, 235);
}

.dark .detail-section {
  background: rgb(17, 24, 39);
  border-color: rgb(55, 65, 81);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: rgb(107, 114, 128);
}

.dark .section-header {
  color: rgb(156, 163, 175);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(17, 24, 39);
  margin: 0;
}

.dark .section-title {
  color: rgb(243, 244, 246);
}

.section-content {
  color: rgb(55, 65, 81);
}

.dark .section-content {
  color: rgb(209, 213, 219);
}

.notes-content {
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.timeline-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgb(229, 231, 235);
}

.dark .timeline-item {
  border-bottom-color: rgb(55, 65, 81);
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-label {
  font-weight: 500;
  color: rgb(107, 114, 128);
}

.dark .timeline-label {
  color: rgb(156, 163, 175);
}

.timeline-value {
  color: rgb(17, 24, 39);
  font-weight: 500;
}

.dark .timeline-value {
  color: rgb(243, 244, 246);
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metadata-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(107, 114, 128);
}

.dark .metadata-label {
  color: rgb(156, 163, 175);
}

.metadata-value {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(17, 24, 39);
}

.dark .metadata-value {
  color: rgb(243, 244, 246);
}

.info-item-block {
  padding: 12px;
  background: rgb(243, 244, 251);
  border-radius: 8px;
  border: 1px solid rgb(229, 231, 235);
}

.dark .info-item-block {
  background: rgb(30, 41, 59);
  border-color: rgb(55, 65, 81);
}

.info-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item-actions {
  display: flex;
  gap: 4px;
}

.info-item-content {
  white-space: pre-wrap;
  line-height: 1.5;
  margin: 0;
  font-size: 0.875rem;
}

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
</style>
