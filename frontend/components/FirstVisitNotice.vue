<template>
  <UModal v-model="isOpen" :prevent-close="false">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-heroicons-information-circle" class="text-2xl text-blue-600 dark:text-blue-400" />
          </div>
          <h2 class="text-xl font-bold">Welcome to Application Tracker</h2>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          Your data is stored <strong>locally in your browser</strong>. This means:
        </p>

        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="text-green-500 mt-0.5 flex-shrink-0" />
            <span>Your data stays private - nothing is sent to any server</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-check-circle" class="text-green-500 mt-0.5 flex-shrink-0" />
            <span>Works offline after the first load</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-amber-500 mt-0.5 flex-shrink-0" />
            <span>Clearing browser data will delete your applications</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-amber-500 mt-0.5 flex-shrink-0" />
            <span>Data won't sync between devices automatically</span>
          </li>
        </ul>

        <UAlert
          color="blue"
          variant="soft"
          icon="i-heroicons-light-bulb"
          title="Tip: Export your data regularly"
          description="Use the Export button to save a backup file. You can import it later to restore your data or move to another device."
        />
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton @click="handleAcknowledge" size="lg">
            Got it, let's start!
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const { shouldShowFirstVisitNotice, acknowledgeFirstVisit } = useBackup()

const isOpen = computed({
  get: () => shouldShowFirstVisitNotice.value,
  set: () => {} // Prevent closing without acknowledgment
})

const handleAcknowledge = () => {
  acknowledgeFirstVisit()
}
</script>
