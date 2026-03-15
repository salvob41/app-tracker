import type { InfoItem, InfoItemCreate, InfoItemUpdate } from '~/types'

export const useInfoItems = () => {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    const getInfoItems = async (applicationId: number): Promise<InfoItem[]> => {
        return await $fetch<InfoItem[]>(`${apiBase}/applications/${applicationId}/info-items/`)
    }

    const createInfoItem = async (applicationId: number, item: InfoItemCreate): Promise<InfoItem> => {
        return await $fetch<InfoItem>(`${apiBase}/applications/${applicationId}/info-items/`, {
            method: 'POST',
            body: item
        })
    }

    const updateInfoItem = async (
        applicationId: number,
        itemId: number,
        item: InfoItemUpdate
    ): Promise<InfoItem> => {
        return await $fetch<InfoItem>(`${apiBase}/applications/${applicationId}/info-items/${itemId}`, {
            method: 'PUT',
            body: item
        })
    }

    const deleteInfoItem = async (applicationId: number, itemId: number): Promise<void> => {
        await $fetch(`${apiBase}/applications/${applicationId}/info-items/${itemId}`, {
            method: 'DELETE'
        })
    }

    return {
        getInfoItems,
        createInfoItem,
        updateInfoItem,
        deleteInfoItem
    }
}
