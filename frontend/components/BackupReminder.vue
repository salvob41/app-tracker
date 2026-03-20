<template>
  <Transition name="slide">
    <div
      v-if="visible"
      class="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-lg flex-shrink-0" />
            <span>
              <template v-if="!lastBackupDate">
                You haven't backed up your data yet.
              </template>
              <template v-else-if="daysSinceBackup !== null && daysSinceBackup >= 7">
                Last backup was {{ lastBackupFormatted }}. Consider exporting your data.
              </template>
              <template v-else>
                You've made {{ changesSinceBackup }} changes since your last backup.
              </template>
              <span class="hidden sm:inline text-amber-600 dark:text-amber-400">
                Data is stored in your browser only.
              </span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              size="xs"
              color="amber"
              variant="solid"
              icon="i-heroicons-arrow-down-tray"
              @click="handleExport"
            >
              Export Now
            </UButton>
            <UButton
              size="xs"
              color="amber"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="dismiss"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { 
  shouldShowReminder, 
  lastBackupDate, 
  lastBackupFormatted,
  daysSinceBackup, 
  changesSinceBackup,
  recordBackup 
} = useBackup()

const dismissed = ref(false)

const visible = computed(() => shouldShowReminder.value && !dismissed.value)

const dismiss = () => {
  dismissed.value = true
}

const emit = defineEmits<{
  export: []
}>()

const handleExport = () => {
  emit('export')
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
