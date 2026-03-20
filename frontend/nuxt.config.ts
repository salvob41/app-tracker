// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-01-01',
    devtools: { enabled: true },
    ssr: false,
    modules: ['@nuxt/ui', '@nuxt/icon'],
    app: {
        baseURL: process.env.NUXT_PUBLIC_BASE_URL || '/',
    },
    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
            storageMode: process.env.NUXT_PUBLIC_STORAGE_MODE || 'api',
        }
    },
    css: ['~/assets/css/main.css'],
})
