// frontend/adapters/api.ts
import type { StorageAdapter } from '~/types/storage'
import type {
  Application,
  ApplicationWithInfoItems,
  ApplicationCreate,
  ApplicationUpdate,
  InfoItem,
  InfoItemCreate,
  InfoItemUpdate,
  Stage,
} from '~/types'

const getBase = () => useRuntimeConfig().public.apiBase

export const apiAdapter: StorageAdapter = {
  // Applications
  async getApplications(): Promise<Application[]> {
    return $fetch<Application[]>(`${getBase()}/applications`)
  },

  async getApplication(id: number | string): Promise<ApplicationWithInfoItems> {
    return $fetch<ApplicationWithInfoItems>(`${getBase()}/applications/${id}`)
  },

  async createApplication(data: ApplicationCreate): Promise<Application> {
    return $fetch<Application>(`${getBase()}/applications`, {
      method: 'POST',
      body: data,
    })
  },

  async updateApplication(id: number | string, data: ApplicationUpdate): Promise<Application> {
    return $fetch<Application>(`${getBase()}/applications/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deleteApplication(id: number | string): Promise<void> {
    await $fetch(`${getBase()}/applications/${id}`, { method: 'DELETE' })
  },

  // Stages
  async getStages(): Promise<Stage[]> {
    return $fetch<Stage[]>(`${getBase()}/stages`)
  },

  async addStage(stage: Omit<Stage, 'id'>): Promise<Stage> {
    return $fetch<Stage>(`${getBase()}/stages`, {
      method: 'POST',
      body: stage,
    })
  },

  async updateStage(id: number | string, stage: Partial<Stage>): Promise<Stage> {
    return $fetch<Stage>(`${getBase()}/stages/${id}`, {
      method: 'PATCH',
      body: stage,
    })
  },

  async deleteStage(id: number | string): Promise<void> {
    await $fetch(`${getBase()}/stages/${id}`, { method: 'DELETE' })
  },

  // Info Items
  async getInfoItems(applicationId: number | string): Promise<InfoItem[]> {
    return $fetch<InfoItem[]>(`${getBase()}/applications/${applicationId}/info-items/`)
  },

  async createInfoItem(applicationId: number | string, item: InfoItemCreate): Promise<InfoItem> {
    return $fetch<InfoItem>(`${getBase()}/applications/${applicationId}/info-items/`, {
      method: 'POST',
      body: item,
    })
  },

  async updateInfoItem(applicationId: number | string, itemId: number | string, item: InfoItemUpdate): Promise<InfoItem> {
    return $fetch<InfoItem>(`${getBase()}/applications/${applicationId}/info-items/${itemId}`, {
      method: 'PUT',
      body: item,
    })
  },

  async deleteInfoItem(applicationId: number | string, itemId: number | string): Promise<void> {
    await $fetch(`${getBase()}/applications/${applicationId}/info-items/${itemId}`, { method: 'DELETE' })
  },
}
