<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Backup Reminder Banner (local storage mode only) -->
    <ClientOnly v-if="isLocalStorageMode">
      <BackupReminder @export="handleQuickExport" />
    </ClientOnly>

    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-briefcase" class="text-3xl text-primary" />
            <h1 class="text-2xl font-bold">Application Tracker</h1>
          </div>
          <div class="flex items-center gap-3">
            <UButton 
              icon="i-heroicons-plus" 
              @click="openCreateModal"
              size="lg"
            >
              New Application
            </UButton>
            <!-- Export button (local storage mode only) -->
            <UTooltip v-if="isLocalStorageMode" text="Export backup">
              <UButton
                icon="i-heroicons-arrow-down-tray"
                color="gray"
                variant="ghost"
                @click="handleQuickExport"
              />
            </UTooltip>
            <UButton
              icon="i-heroicons-cog-6-tooth"
              color="gray"
              variant="ghost"
              @click="showStagesSettings = true"
            />
            <ClientOnly>
              <UButton
                :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
                color="gray"
                variant="ghost"
                @click="toggleDark"
              />
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>

    <main>
      <div v-if="pending" class="flex justify-center items-center h-96">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin" />
      </div>

      <div v-else-if="error" class="max-w-7xl mx-auto px-4 py-8">
        <UAlert 
          color="red" 
          variant="soft"
          title="Error loading applications"
          :description="error.message"
        />
      </div>

      <KanbanBoard
        v-else
        :applications="applications"
        :stages="stages"
        @update-stage="handleUpdateStage"
        @edit="openEditModal"
        @delete="handleDelete"
        @click="openDetailModal"
      />
    </main>

    <ApplicationForm
      v-model="showModal"
      :application="selectedApplication"
      :stages="stages"
      @submit="handleSubmit"
    />

    <ApplicationDetail
      v-model="showDetailModal"
      :application="selectedApplicationDetail"
      @edit="openEditFromDetail"
      @delete="handleDelete"
    />

    <StagesSettings
      v-model="showStagesSettings"
      :stages="stages"
    />

    <ConfirmDeleteModal
      v-model="showDeleteModal"
      :application-name="appToDelete?.company || ''"
      :loading="deleteLoading"
      @confirm="handleConfirmDelete"
    />

    <StageCommentModal
      v-model="showCommentModal"
      :pending-transition="pendingTransition"
      @save="handleCommentSave"
      @skip="handleCommentSkip"
    />

    <!-- First Visit Notice (local storage mode only) -->
    <ClientOnly v-if="isLocalStorageMode">
      <FirstVisitNotice />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { Application, ApplicationCreate, InfoItemCreate } from '~/types'

const config = useRuntimeConfig()
const isLocalStorageMode = config.public.storageMode === 'local'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toast = useToast()
const { recordBackup, recordChange } = useBackup()

const toggleDark = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const { getApplications, createApplication, updateApplication, deleteApplication } = useApplications()
const { createInfoItem, updateInfoItem } = useInfoItems()
const { stages, loadStages } = useStages()

const applications = ref<Application[]>([])
const pending = ref(true)
const error = ref<Error | null>(null)
const showModal = ref(false)
const selectedApplication = ref<Application | undefined>()
const showDetailModal = ref(false)
const selectedApplicationDetail = ref<Application | undefined>()
const showStagesSettings = ref(false)

const showCommentModal = ref(false)
const pendingTransition = ref<{
  appId: number | string
  fromStage: string
  toStage: string
  eventItemId: number | string | null
} | null>(null)
/** Block detail modal for this app while transition+comment flow is in progress */
const blockDetailForAppId = ref<number | string | null>(null)

// Delete Modal State
const showDeleteModal = ref(false)
const appToDelete = ref<Application | null>(null)
const deleteLoading = ref(false)

const loadApplications = async (showLoading = true) => {
  try {
    if (showLoading) pending.value = true
    error.value = null
    const [fetchedApps] = await Promise.all([
      getApplications(),
      loadStages()
    ])
    applications.value = fetchedApps
  } catch (e) {
    error.value = e as Error
  } finally {
    if (showLoading) pending.value = false
  }
}

const openCreateModal = () => {
  selectedApplication.value = undefined
  showModal.value = true
}

const openEditModal = (app: Application) => {
  selectedApplication.value = app
  showModal.value = true
}

const openDetailModal = (app: Application) => {
  if (blockDetailForAppId.value === app.id) return
  selectedApplicationDetail.value = app
  showDetailModal.value = true
}

const openEditFromDetail = (app: Application) => {
  selectedApplication.value = app
  showModal.value = true
}

const handleSubmit = async (data: ApplicationCreate) => {
  try {
    if (selectedApplication.value) {
      // Optimistic update
      const index = applications.value.findIndex(a => a.id === selectedApplication.value!.id)
      if (index !== -1) {
        applications.value[index] = { ...applications.value[index], ...data }
      }
      await updateApplication(selectedApplication.value.id, data)
    } else {
      await createApplication(data)
    }
    showModal.value = false
    await loadApplications(false) // Refresh in background
    
    // Record change for backup tracking
    if (isLocalStorageMode) recordChange()
  } catch (e) {
    console.error('Failed to save application:', e)
    await loadApplications() // Revert to server state on error
  }
}

const handleUpdateStage = async (id: number | string, toStage: string, fromStage: string) => {
  blockDetailForAppId.value = id
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
    
    // Record change for backup tracking
    if (isLocalStorageMode) recordChange()
  } catch (e) {
    blockDetailForAppId.value = null
    console.error('Failed to update stage:', e)
    await loadApplications()
  }
}

const handleCommentSave = async (comment: string) => {
  if (!pendingTransition.value?.eventItemId) return
  const { appId, eventItemId } = pendingTransition.value
  try {
    await updateInfoItem(appId, eventItemId, { content: comment })
    const idx = applications.value.findIndex(a => a.id === appId)
    if (idx !== -1) {
      applications.value[idx] = { ...applications.value[idx], last_event_preview: comment }
    }
  } finally {
    showCommentModal.value = false
    pendingTransition.value = null
    blockDetailForAppId.value = null
  }
}

const handleCommentSkip = () => {
  showCommentModal.value = false
  pendingTransition.value = null
  blockDetailForAppId.value = null
}

const handleDelete = (id: number | string) => {
  const app = applications.value.find(a => a.id === id)
  if (app) {
    appToDelete.value = app
    showDeleteModal.value = true
  }
}

const handleConfirmDelete = async () => {
  if (!appToDelete.value) return
  
  try {
    deleteLoading.value = true
    const id = appToDelete.value.id
    
    // Optimistic update
    applications.value = applications.value.filter(a => a.id !== id)
    if (selectedApplicationDetail.value?.id === id) {
      showDetailModal.value = false
    }

    await deleteApplication(id)
    showDeleteModal.value = false
    
    // Record change for backup tracking
    if (isLocalStorageMode) recordChange()
  } catch (e) {
    console.error('Failed to delete application:', e)
    await loadApplications() // Revert on error
  } finally {
    deleteLoading.value = false
    appToDelete.value = null
  }
}

// Quick export from header button
const handleQuickExport = () => {
  const KEYS = {
    applications: 'app-tracker:applications',
    stages: 'app-tracker:stages',
    infoItems: 'app-tracker:info-items',
  }

  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    applications: JSON.parse(localStorage.getItem(KEYS.applications) || '[]'),
    stages: JSON.parse(localStorage.getItem(KEYS.stages) || '[]'),
    infoItems: JSON.parse(localStorage.getItem(KEYS.infoItems) || '[]'),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().split('T')[0]
  const a = document.createElement('a')
  a.href = url
  a.download = `app-tracker-export-${date}.json`
  a.click()
  URL.revokeObjectURL(url)

  recordBackup()
  toast.add({ title: 'Data exported successfully', color: 'green', icon: 'i-heroicons-check-circle' })
}

onMounted(() => {
  loadApplications()
})
</script>
