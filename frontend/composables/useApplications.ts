import type { Application, ApplicationWithInfoItems, ApplicationCreate, ApplicationUpdate } from '~/types'

export const useApplications = () => {
    const adapter = useStorage()

    const getApplications = async (): Promise<Application[]> => {
        return adapter.getApplications()
    }

    const getApplication = async (id: number | string): Promise<ApplicationWithInfoItems> => {
        return adapter.getApplication(id)
    }

    const createApplication = async (application: ApplicationCreate): Promise<Application> => {
        return adapter.createApplication(application)
    }

    const updateApplication = async (id: number | string, application: ApplicationUpdate): Promise<Application> => {
        return adapter.updateApplication(id, application)
    }

    const deleteApplication = async (id: number | string): Promise<void> => {
        return adapter.deleteApplication(id)
    }

    return {
        getApplications,
        getApplication,
        createApplication,
        updateApplication,
        deleteApplication,
    }
}
