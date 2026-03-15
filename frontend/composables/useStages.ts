import type { Stage } from '~/types'

export const useStages = () => {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    const stages = useState<Stage[]>('stages', () => [])

    const fetchStages = async () => {
        return await $fetch<Stage[]>(`${apiBase}/stages`)
    }

    const loadStages = async () => {
        try {
            stages.value = await fetchStages()
        } catch (error) {
            console.error('Failed to load stages:', error)
        }
    }

    const addStage = async (stage: Omit<Stage, 'id'>) => {
        await $fetch<Stage>(`${apiBase}/stages`, {
            method: 'POST',
            body: stage
        })
        await loadStages()
    }

    const updateStage = async (id: number, stage: Partial<Stage>) => {
        await $fetch<Stage>(`${apiBase}/stages/${id}`, {
            method: 'PATCH',
            body: stage
        })
        await loadStages()
    }

    const deleteStage = async (id: number) => {
        await $fetch(`${apiBase}/stages/${id}`, {
            method: 'DELETE'
        })
        await loadStages()
    }

    return {
        stages: readonly(stages),
        loadStages,
        addStage,
        updateStage,
        deleteStage
    }
}
