import type { Stage } from '~/types'

export const useStages = () => {
    const adapter = useStorage()
    const stages = useState<Stage[]>('stages', () => [])

    const loadStages = async () => {
        try {
            stages.value = await adapter.getStages()
        } catch (error) {
            console.error('Failed to load stages:', error)
        }
    }

    const addStage = async (stage: Omit<Stage, 'id'>) => {
        const newStage = await adapter.addStage(stage)
        stages.value = [...stages.value, newStage]
    }

    const updateStage = async (id: number | string, stage: Partial<Stage>) => {
        const updated = await adapter.updateStage(id, stage)
        stages.value = stages.value.map(s => String(s.id) === String(id) ? updated : s)
    }

    const deleteStage = async (id: number | string) => {
        await adapter.deleteStage(id)
        stages.value = stages.value.filter(s => String(s.id) !== String(id))
    }

    return {
        stages: readonly(stages),
        loadStages,
        addStage,
        updateStage,
        deleteStage,
    }
}
