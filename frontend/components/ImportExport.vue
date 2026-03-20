<template>
  <div class="space-y-3">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Data</h3>
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
      @change="handleImport"
    />
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)
const importing = ref(false)

const KEYS = {
  applications: 'app-tracker:applications',
  stages: 'app-tracker:stages',
  infoItems: 'app-tracker:info-items',
}

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
}

function triggerImport() {
  fileInput.value?.click()
}

async function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  importing.value = true
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)

    if (
      !('version' in parsed) ||
      !('applications' in parsed) ||
      !('stages' in parsed) ||
      !('infoItems' in parsed)
    ) {
      toast.add({ title: 'Invalid file format', color: 'red' })
      return
    }

    if (parsed.version !== 1) {
      toast.add({ title: 'Unsupported file version', color: 'red' })
      return
    }

    if (
      !Array.isArray(parsed.applications) ||
      !Array.isArray(parsed.stages) ||
      !Array.isArray(parsed.infoItems)
    ) {
      toast.add({ title: 'Invalid file format', color: 'red' })
      return
    }

    try {
      localStorage.setItem(KEYS.applications, JSON.stringify(parsed.applications))
      localStorage.setItem(KEYS.stages, JSON.stringify(parsed.stages))
      localStorage.setItem(KEYS.infoItems, JSON.stringify(parsed.infoItems))
    } catch {
      toast.add({ title: 'Import failed: storage quota exceeded', color: 'red' })
      return
    }

    window.location.reload()
  } catch {
    toast.add({ title: 'Invalid file format', color: 'red' })
  } finally {
    importing.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>
