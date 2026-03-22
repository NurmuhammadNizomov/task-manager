// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-12',
  ssr: true,
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/fonts'
  ],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: ''
  },
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ru', language: 'ru-RU', name: 'Russian', file: 'ru.json' },
      { code: 'uz', language: 'uz-UZ', name: 'Uzbek', file: 'uz.json' }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: false
  },
  fonts: {
    families: [
      {
        name: 'Manrope',
        provider: 'google'
      }
    ]
  },
  vite: {
    optimizeDeps: {
      include: ['dayjs', 'dayjs/plugin/relativeTime', 'zod', '@vue/devtools-core', '@vue/devtools-kit', 'ua-parser-js']
    }
  },
  runtimeConfig: {
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongodbUri: process.env.MONGODB_URI,
    mongodbDbName: process.env.MONGODB_DB_NAME || 'task-manager',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpFrom: process.env.SMTP_FROM,
    public: {
      appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/google-redirect'
    }
  },
  routeRules: {
    '/**': {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'unsafe-none'
      }
    },
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/dashboard': { ssr: false },
    '/profile': { ssr: false },
    '/projects/**': { ssr: false },
    '/google-redirect': { ssr: false }
  }
})
