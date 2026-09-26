export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxthub/core',
    '@nuxtjs/cloudinary',
    'nuxt-auth-utils',
    'vuetify-nuxt-module',
  ],
  hub: {
    db: process.env.CLOUDFLARE_D1_DATABASE_ID
      ? {
          dialect: 'sqlite',
          driver: 'd1',
          connection: {
            databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID,
          },
        }
      : 'sqlite',
    blob: false,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  },
  vuetify: {
    moduleOptions: {
      prefixComposables: ['useLayout'],
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            dark: false,
            colors: {
              primary: '#A84618',
              secondary: '#5E6260',
              background: '#F4EFE4',
              surface: '#FAF8F3',
              'on-background': '#292A29',
              'on-surface': '#292A29',
              'on-primary': '#FFFFFF',
              'on-secondary': '#FFFFFF',
            },
          },
        },
      },
    },
  },
  runtimeConfig: {
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    bootstrapSecret: process.env.NUXT_BOOTSTRAP_SECRET,
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
    },
    public: {
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    },
  },
})
