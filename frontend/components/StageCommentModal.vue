<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }" :prevent-close="false">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="text-lg text-primary" />
          <h3 class="font-semibold text-base">Add a comment</h3>
        </div>
      </template>

      <div class="space-y-3">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Moved
          <UBadge :color="fromColor" variant="subtle" size="sm">{{ fromLabel }}</UBadge>
          →
          <UBadge :color="toColor" variant="subtle" size="sm">{{ toLabel }}</UBadge>
        </p>
        <UTextarea
          v-model="comment"
          placeholder="Optional comment about this transition..."
          :rows="3"
          autofocus
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="ghost" @click="skip">Skip</UButton>
          <UButton :disabled="!comment.trim()" @click="save">Save comment</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { Stage } from '~/types'

const props = defineProps<{
  modelValue: boolean
  pendingTransition: {
    appId: number
    fromStage: string
    toStage: string
    eventItemId: number | null
  } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [comment: string]
  skip: []
}>()

const { stages } = useStages()
const comment = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

watch(() => props.modelValue, (open) => {
  if (open) comment.value = ''
})

const getStage = (key: string | null | undefined): Stage | undefined =>
  stages.value.find(s => s.key === key)

const fromLabel = computed(() => getStage(props.pendingTransition?.fromStage)?.label ?? props.pendingTransition?.fromStage ?? '')
const toLabel = computed(() => getStage(props.pendingTransition?.toStage)?.label ?? props.pendingTransition?.toStage ?? '')
const fromColor = computed(() => getStage(props.pendingTransition?.fromStage)?.color ?? 'gray')
const toColor = computed(() => getStage(props.pendingTransition?.toStage)?.color ?? 'gray')

const save = () => emit('save', comment.value.trim())
const skip = () => emit('skip')
</script>
