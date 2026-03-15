import type { Application, ApplicationCreate, ApplicationUpdate } from '~/types'

export const useApplications = () => {
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    const getApplications = async (): Promise<Application[]> => {
        return await $fetch<Application[]>(`${apiBase}/applications`)
    }

    const getApplication = async (id: number): Promise<Application> => {
        return await $fetch<Application>(`${apiBase}/applications/${id}`)
    }

    const createApplication = async (application: ApplicationCreate): Promise<Application> => {
        return await $fetch<Application>(`${apiBase}/applications`, {
            method: 'POST',
            body: application
        })
    }

    const updateApplication = async (id: number, application: ApplicationUpdate): Promise<Application> => {
        return await $fetch<Application>(`${apiBase}/applications/${id}`, {
            method: 'PUT',
            body: application
        })
    }

    const deleteApplication = async (id: number): Promise<void> => {
        await $fetch(`${apiBase}/applications/${id}`, {
            method: 'DELETE'
        })
    }

    return {
        getApplications,
        getApplication,
        createApplication,
        updateApplication,
        deleteApplication
    }
}
