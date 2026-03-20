// frontend/adapters/localStorage.ts
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

const KEYS = {
  applications: 'app-tracker:applications',
  stages: 'app-tracker:stages',
  infoItems: 'app-tracker:info-items',
} as const

const DEFAULT_STAGES: Omit<Stage, 'id'>[] = [
  { key: 'wishlist', label: 'Wishlist', color: 'gray', order: 1 },
  { key: 'applied', label: 'Applied', color: 'blue', order: 2 },
  { key: 'interview', label: 'Interview', color: 'yellow', order: 3 },
  { key: 'rejected', label: 'Rejected', color: 'red', order: 4 },
]

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function uuid(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

function seedStagesIfEmpty(): Stage[] {
  const stages = read<Stage>(KEYS.stages)
  if (stages.length > 0) return stages
  const seeded = DEFAULT_STAGES.map(s => ({ ...s, id: uuid() }))
  write(KEYS.stages, seeded)
  return seeded
}

export const localStorageAdapter: StorageAdapter = {
  // Applications
  async getApplications(): Promise<Application[]> {
    return read<Application>(KEYS.applications)
  },

  async getApplication(id: number | string): Promise<ApplicationWithInfoItems> {
    const apps = read<Application>(KEYS.applications)
    const app = apps.find(a => String(a.id) === String(id))
    if (!app) throw new Error(`Application ${id} not found`)
    const infoItems = read<InfoItem>(KEYS.infoItems).filter(
      i => String(i.application_id) === String(id)
    )
    return { ...app, info_items: infoItems }
  },

  async createApplication(data: ApplicationCreate): Promise<Application> {
    const apps = read<Application>(KEYS.applications)
    const newApp: Application = {
      ...data,
      id: uuid(),
      created_at: now(),
    }
    write(KEYS.applications, [...apps, newApp])
    return newApp
  },

  async updateApplication(id: number | string, data: ApplicationUpdate): Promise<Application> {
    const apps = read<Application>(KEYS.applications)
    const index = apps.findIndex(a => String(a.id) === String(id))
    if (index === -1) throw new Error(`Application ${id} not found`)
    const updated = { ...apps[index], ...data, updated_at: now() }
    apps[index] = updated
    write(KEYS.applications, apps)
    return updated
  },

  async deleteApplication(id: number | string): Promise<void> {
    const apps = read<Application>(KEYS.applications)
    write(KEYS.applications, apps.filter(a => String(a.id) !== String(id)))
    // Also remove associated info items
    const items = read<InfoItem>(KEYS.infoItems)
    write(KEYS.infoItems, items.filter(i => String(i.application_id) !== String(id)))
  },

  // Stages
  async getStages(): Promise<Stage[]> {
    return seedStagesIfEmpty()
  },

  async addStage(stage: Omit<Stage, 'id'>): Promise<Stage> {
    const stages = read<Stage>(KEYS.stages)
    const newStage: Stage = { ...stage, id: uuid() }
    write(KEYS.stages, [...stages, newStage])
    return newStage
  },

  async updateStage(id: number | string, stage: Partial<Stage>): Promise<Stage> {
    const stages = read<Stage>(KEYS.stages)
    const index = stages.findIndex(s => String(s.id) === String(id))
    if (index === -1) throw new Error(`Stage ${id} not found`)
    const updated = { ...stages[index], ...stage }
    stages[index] = updated
    write(KEYS.stages, stages)
    return updated
  },

  async deleteStage(id: number | string): Promise<void> {
    const stages = read<Stage>(KEYS.stages)
    write(KEYS.stages, stages.filter(s => String(s.id) !== String(id)))
  },

  // Info Items
  async getInfoItems(applicationId: number | string): Promise<InfoItem[]> {
    return read<InfoItem>(KEYS.infoItems).filter(
      i => String(i.application_id) === String(applicationId)
    )
  },

  async createInfoItem(applicationId: number | string, item: InfoItemCreate): Promise<InfoItem> {
    const items = read<InfoItem>(KEYS.infoItems)
    const newItem: InfoItem = {
      ...item,
      id: uuid(),
      application_id: applicationId,
      created_at: now(),
    }
    write(KEYS.infoItems, [...items, newItem])
    return newItem
  },

  async updateInfoItem(applicationId: number | string, itemId: number | string, item: InfoItemUpdate): Promise<InfoItem> {
    const items = read<InfoItem>(KEYS.infoItems)
    const index = items.findIndex(
      i => String(i.id) === String(itemId) && String(i.application_id) === String(applicationId)
    )
    if (index === -1) throw new Error(`InfoItem ${itemId} not found`)
    const updated = { ...items[index], ...item }
    items[index] = updated
    write(KEYS.infoItems, items)
    return updated
  },

  async deleteInfoItem(applicationId: number | string, itemId: number | string): Promise<void> {
    const items = read<InfoItem>(KEYS.infoItems)
    write(
      KEYS.infoItems,
      items.filter(
        i => !(String(i.id) === String(itemId) && String(i.application_id) === String(applicationId))
      )
    )
  },
}
