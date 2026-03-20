export interface Application {
    id: number | string
    company: string
    stage: string
    notes?: string
    created_at: string
    updated_at?: string
    last_event_preview?: string | null
}

export interface InfoItem {
    id: number | string
    application_id: number | string
    tag?: string | null
    content?: string | null
    event_type?: 'transition' | 'comment' | null
    event_date?: string | null
    from_stage?: string | null
    to_stage?: string | null
    created_at: string
}

export interface ApplicationWithInfoItems extends Application {
    info_items: InfoItem[]
}

export interface Stage {
    id: number | string
    key: string
    label: string
    color: string
    order: number
}

export type ApplicationCreate = Omit<Application, 'id' | 'created_at' | 'updated_at' | 'last_event_preview'>
export type ApplicationUpdate = Partial<ApplicationCreate>
export type InfoItemCreate = Omit<InfoItem, 'id' | 'application_id' | 'created_at'>
export type InfoItemUpdate = Partial<InfoItemCreate>
