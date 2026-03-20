import type { InfoItem, InfoItemCreate, InfoItemUpdate } from '~/types'

export const useInfoItems = () => {
    const adapter = useStorage()

    const getInfoItems = async (applicationId: number | string): Promise<InfoItem[]> => {
        return adapter.getInfoItems(applicationId)
    }

    const createInfoItem = async (applicationId: number | string, item: InfoItemCreate): Promise<InfoItem> => {
        return adapter.createInfoItem(applicationId, item)
    }

    const updateInfoItem = async (
        applicationId: number | string,
        itemId: number | string,
        item: InfoItemUpdate
    ): Promise<InfoItem> => {
        return adapter.updateInfoItem(applicationId, itemId, item)
    }

    const deleteInfoItem = async (applicationId: number | string, itemId: number | string): Promise<void> => {
        return adapter.deleteInfoItem(applicationId, itemId)
    }

    return {
        getInfoItems,
        createInfoItem,
        updateInfoItem,
        deleteInfoItem,
    }
}
