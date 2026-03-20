// frontend/composables/useStorage.ts
import type { StorageAdapter } from '~/types/storage'
import { apiAdapter } from '~/adapters/api'
import { localStorageAdapter } from '~/adapters/localStorage'

export const useStorage = (): StorageAdapter => {
  const config = useRuntimeConfig()
  return config.public.storageMode === 'local' ? localStorageAdapter : apiAdapter
}
