<template>
  <UModal v-model="isOpen">
    <div class="p-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
          <UIcon name="i-heroicons-trash" class="text-2xl" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Delete Application</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 font-medium">
        Are you sure you want to remove <span class="text-red-600 dark:text-red-400">{{ applicationName }}</span>?
      </div>

      <div class="flex justify-end gap-3">
        <UButton
          color="gray"
          variant="ghost"
          @click="isOpen = false"
          :disabled="loading"
        >
          Cancel
        </UButton>
        <UButton
          color="red"
          @click="onConfirm"
          :loading="loading"
        >
          Confirm Delete
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  applicationName: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const onConfirm = () => {
  emit('confirm')
}
</script>
