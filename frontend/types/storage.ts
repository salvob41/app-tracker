// frontend/types/storage.ts
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

export interface StorageAdapter {
  // Applications
  getApplications(): Promise<Application[]>
  getApplication(id: number | string): Promise<ApplicationWithInfoItems>
  createApplication(data: ApplicationCreate): Promise<Application>
  updateApplication(id: number | string, data: ApplicationUpdate): Promise<Application>
  deleteApplication(id: number | string): Promise<void>

  // Stages
  getStages(): Promise<Stage[]>
  addStage(stage: Omit<Stage, 'id'>): Promise<Stage>
  updateStage(id: number | string, stage: Partial<Stage>): Promise<Stage>
  deleteStage(id: number | string): Promise<void>

  // Info Items (always scoped to an application)
  getInfoItems(applicationId: number | string): Promise<InfoItem[]>
  createInfoItem(applicationId: number | string, item: InfoItemCreate): Promise<InfoItem>
  updateInfoItem(applicationId: number | string, itemId: number | string, item: InfoItemUpdate): Promise<InfoItem>
  deleteInfoItem(applicationId: number | string, itemId: number | string): Promise<void>
}
