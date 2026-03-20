<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Data Backup</h3>
      <span class="text-xs text-gray-500 dark:text-gray-400">
        Last backup: {{ lastBackupFormatted }}
      </span>
    </div>
    
    <p class="text-xs text-gray-500 dark:text-gray-400">
      Your data is stored locally in your browser. Export regularly to keep a backup.
    </p>

    <div class="flex gap-2">
      <UButton
        icon="i-heroicons-arrow-down-tray"
        variant="outline"
        size="sm"
        @click="handleExport"
      >
        Export JSON
      </UButton>
      <UButton
        icon="i-heroicons-arrow-up-tray"
        variant="outline"
        size="sm"
        @click="triggerImport"
        :loading="importing"
      >
        Import JSON
      </UButton>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileSelect"
    />

    <ImportConfirmModal
      v-model="showConfirmModal"
      :current-stats="currentStats"
      :import-stats="importStats"
      @confirm="confirmImport"
      @cancel="cancelImport"
      @export-first="handleExportThenImport"
    />
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const { recordBackup, lastBackupFormatted } = useBackup()
const fileInput = ref<HTMLInputElement | null>(null)
const importing = ref(false)
const showConfirmModal = ref(false)
const pendingImportData = ref<any>(null)

const KEYS = {
  applications: 'app-tracker:applications',
  stages: 'app-tracker:stages',
  infoItems: 'app-tracker:info-items',
}

const currentStats = computed(() => ({
  applications: JSON.parse(localStorage.getItem(KEYS.applications) || '[]').length,
  stages: JSON.parse(localStorage.getItem(KEYS.stages) || '[]').length,
}))

const importStats = computed(() => ({
  applications: pendingImportData.value?.applications?.length || 0,
  stages: pendingImportData.value?.stages?.length || 0,
}))

function handleExport() {
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

  // Record backup
  recordBackup()
  toast.add({ title: 'Data exported successfully', color: 'green', icon: 'i-heroicons-check-circle' })
}

function triggerImport() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  importing.value = true
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)

    // Validate structure
    if (
      !('version' in parsed) ||
      !('applications' in parsed) ||
      !('stages' in parsed) ||
      !('infoItems' in parsed)
    ) {
      toast.add({ title: 'Invalid file format', color: 'red', icon: 'i-heroicons-x-circle' })
      return
    }

    if (parsed.version !== 1) {
      toast.add({ title: 'Unsupported file version', color: 'red', icon: 'i-heroicons-x-circle' })
      return
    }

    if (
      !Array.isArray(parsed.applications) ||
      !Array.isArray(parsed.stages) ||
      !Array.isArray(parsed.infoItems)
    ) {
      toast.add({ title: 'Invalid file format', color: 'red', icon: 'i-heroicons-x-circle' })
      return
    }

    // Store pending data and show confirmation
    pendingImportData.value = parsed
    showConfirmModal.value = true
  } catch {
    toast.add({ title: 'Could not read file', color: 'red', icon: 'i-heroicons-x-circle' })
  } finally {
    importing.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function confirmImport() {
  if (!pendingImportData.value) return

  try {
    localStorage.setItem(KEYS.applications, JSON.stringify(pendingImportData.value.applications))
    localStorage.setItem(KEYS.stages, JSON.stringify(pendingImportData.value.stages))
    localStorage.setItem(KEYS.infoItems, JSON.stringify(pendingImportData.value.infoItems))
    
    toast.add({ title: 'Data imported successfully', color: 'green', icon: 'i-heroicons-check-circle' })
    window.location.reload()
  } catch {
    toast.add({ title: 'Import failed: storage quota exceeded', color: 'red', icon: 'i-heroicons-x-circle' })
  } finally {
    showConfirmModal.value = false
    pendingImportData.value = null
  }
}

function cancelImport() {
  showConfirmModal.value = false
  pendingImportData.value = null
}

function handleExportThenImport() {
  handleExport()
  // Keep modal open so user can still import after exporting
}

// Expose export function for external calls
defineExpose({ handleExport })
</script>
