// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-01-01',
    devtools: { enabled: true },

    modules: ['@nuxt/ui', '@nuxt/icon'],

    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000'
        }
    },

    css: ['~/assets/css/main.css'],
})
