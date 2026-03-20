<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-3xl' }">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">Manage Columns</h2>
          <UButton 
            icon="i-heroicons-x-mark" 
            color="gray" 
            variant="ghost"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Customize your board columns. Changes are saved automatically.
        </p>

        <!-- Existing Stages -->
        <div class="space-y-2">
            <div v-for="(stage, index) in localStages" :key="stage.key" class="stage-item group">
            <div class="flex items-center gap-3">
                <div class="flex flex-col gap-1">
                    <UButton 
                        icon="i-heroicons-chevron-up" 
                        size="2xs" 
                        variant="ghost"
                        color="gray"
                        :disabled="index === 0"
                        @click="moveStage(index, -1)"
                    />
                    <UButton 
                        icon="i-heroicons-chevron-down" 
                        size="2xs" 
                        variant="ghost" 
                        color="gray"
                        :disabled="index === localStages.length - 1"
                        @click="moveStage(index, 1)"
                    />
                </div>
                
                <UInput 
                v-model="stage.label" 
                placeholder="Stage name"
                class="flex-1"
                @change="handleUpdate(stage)"
                />
                
                <USelect 
                v-model="stage.color" 
                :options="colorOptions"
                class="w-32"
                @change="handleUpdate(stage)"
                />
                
                <UButton 
                icon="i-heroicons-trash" 
                color="red" 
                variant="ghost"
                size="sm"
                @click="confirmDelete(stage)"
                :disabled="localStages.length <= 1"
                />
            </div>
            </div>
        </div>

        <!-- Add New Stage -->
        <UButton
          icon="i-heroicons-plus"
          variant="outline"
          block
          @click="addNewStage"
          :loading="loading"
        >
          Add Column
        </UButton>

        <!-- Import/Export (local mode only) -->
        <template v-if="storageMode === 'local'">
          <UDivider class="my-2" />
          <ImportExport />
        </template>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton color="gray" @click="closeModal">Close</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { Stage } from '~/types'

const config = useRuntimeConfig()
const storageMode = config.public.storageMode

const props = defineProps<{
  modelValue: boolean
  stages: Stage[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { addStage, updateStage, deleteStage } = useStages()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const localStages = ref<Stage[]>([])
const loading = ref(false)

const colorOptions = [
  { label: 'Gray', value: 'gray' },
  { label: 'Blue', value: 'blue' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Purple', value: 'purple' },
  { label: 'Pink', value: 'pink' },
  { label: 'Orange', value: 'orange' },
  { label: 'Teal', value: 'teal' }
]

watch(() => props.stages, (newStages) => {
  localStages.value = JSON.parse(JSON.stringify(newStages))
}, { immediate: true, deep: true })

const addNewStage = async () => {
    loading.value = true
    try {
        const newOrder = localStages.value.length + 1
        const key = `stage_${Date.now()}`
        await addStage({
            key,
            label: 'New Stage',
            color: 'gray',
            order: newOrder
        })
    } finally {
        loading.value = false
    }
}

const handleUpdate = async (stage: Stage) => {
    if (stage.id) {
        await updateStage(stage.id, {
            label: stage.label,
            color: stage.color,
            order: stage.order
        })
    }
}

const moveStage = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= localStages.value.length) return

    const stage = localStages.value[index]
    const swapStage = localStages.value[newIndex]

    // Swap orders
    const tempOrder = stage.order
    stage.order = swapStage.order
    swapStage.order = tempOrder

    // Updates optimistically
    localStages.value[index] = swapStage
    localStages.value[newIndex] = stage

    // Persist
    if (stage.id) await updateStage(stage.id, { order: stage.order })
    if (swapStage.id) await updateStage(swapStage.id, { order: swapStage.order })
}

const confirmDelete = async (stage: Stage) => {
    if (confirm(`Are you sure you want to delete "${stage.label}"? Applications in this stage might be hidden.`)) {
        if (stage.id) {
            await deleteStage(stage.id)
        }
    }
}

const closeModal = () => {
  isOpen.value = false
}
</script>

<style scoped>
.stage-item {
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgb(229, 231, 235);
  transition: all 0.2s;
}

.dark .stage-item {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
}

.stage-item:hover {
  border-color: rgb(156, 163, 175);
}
</style>
