<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ isEdit ? 'Edit Application' : 'New Application' }}
        </h3>
      </template>

      <UForm :state="formData" @submit="handleSubmit" class="space-y-4">
        <UFormGroup label="Company" name="company" required>
          <UInput 
            v-model="formData.company" 
            placeholder="Enter company name"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="Stage" name="stage" required>
          <USelect 
            v-model="formData.stage" 
            :options="stageOptions"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="Notes" name="notes">
          <UTextarea 
            v-model="formData.notes" 
            placeholder="Add notes about this application..."
            :rows="3"
            :disabled="loading"
          />
        </UFormGroup>

        <div class="flex justify-end gap-2">
          <UButton 
            color="gray" 
            variant="ghost" 
            @click="closeModal"
            :disabled="loading"
          >
            Cancel
          </UButton>
          <UButton 
            type="submit"
            :loading="loading"
          >
            {{ isEdit ? 'Update' : 'Create' }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { Application, ApplicationCreate, Stage } from '~/types'

const props = defineProps<{
  modelValue: boolean
  application?: Application
  stages: Stage[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ApplicationCreate]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.application)
const loading = ref(false)

const stageOptions = computed(() => props.stages.map(stage => ({
  label: stage.label,
  value: stage.key
})))

const formData = ref<ApplicationCreate>({
  company: '',
  stage: 'wishlist',
  notes: ''
})

watch(() => props.application, (app) => {
  if (app) {
    formData.value = {
      company: app.company,
      stage: app.stage,
      notes: app.notes || ''
    }
  } else {
    formData.value = {
      company: '',
      stage: 'wishlist',
      notes: ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  try {
    emit('submit', formData.value)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  isOpen.value = false
}
</script>
