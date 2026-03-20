<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-2xl text-amber-600 dark:text-amber-400" />
          </div>
          <h2 class="text-xl font-bold">Import Data</h2>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          Importing will <strong>replace all your current data</strong>. This action cannot be undone.
        </p>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p class="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Current Data (will be replaced)</p>
            <div class="text-sm text-red-700 dark:text-red-300">
              <p>{{ currentStats.applications }} applications</p>
              <p>{{ currentStats.stages }} stages</p>
            </div>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p class="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Import File</p>
            <div class="text-sm text-green-700 dark:text-green-300">
              <p>{{ importStats.applications }} applications</p>
              <p>{{ importStats.stages }} stages</p>
            </div>
          </div>
        </div>

        <UAlert
          v-if="currentStats.applications > 0"
          color="amber"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          title="Consider exporting first"
          description="Export your current data before importing, so you have a backup."
        />
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton
            v-if="currentStats.applications > 0"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-down-tray"
            @click="$emit('export-first')"
          >
            Export First
          </UButton>
          <div class="flex gap-2 ml-auto">
            <UButton color="gray" variant="ghost" @click="$emit('cancel')">
              Cancel
            </UButton>
            <UButton color="red" @click="$emit('confirm')">
              Replace My Data
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
interface Stats {
  applications: number
  stages: number
}

const props = defineProps<{
  modelValue: boolean
  currentStats: Stats
  importStats: Stats
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
  'export-first': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
