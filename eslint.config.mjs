import js from '@eslint/js'
import globals from 'globals'
import vue from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-config-prettier'

// Nuxt auto-imported globals
const nuxtGlobals = {
  // Vue reactivity
  ref: 'readonly', reactive: 'readonly', computed: 'readonly', watch: 'readonly',
  watchEffect: 'readonly', toRef: 'readonly', toRefs: 'readonly', isRef: 'readonly',
  unref: 'readonly', shallowRef: 'readonly', shallowReactive: 'readonly',
  readonly: 'readonly', markRaw: 'readonly', nextTick: 'readonly',
  // Vue lifecycle
  onMounted: 'readonly', onUnmounted: 'readonly', onBeforeMount: 'readonly',
  onBeforeUnmount: 'readonly', onUpdated: 'readonly', onBeforeUpdate: 'readonly',
  // Vue misc
  defineProps: 'readonly', defineEmits: 'readonly', defineExpose: 'readonly',
  withDefaults: 'readonly',
  // Nuxt composables
  useNuxtApp: 'readonly', useRuntimeConfig: 'readonly', useRoute: 'readonly',
  useRouter: 'readonly', navigateTo: 'readonly', useI18n: 'readonly',
  useColorMode: 'readonly', useState: 'readonly', useFetch: 'readonly',
  useAsyncData: 'readonly', useHead: 'readonly', useSeoMeta: 'readonly',
  useToast: 'readonly', useRequestHeaders: 'readonly', useRequestEvent: 'readonly',
  // Nuxt auto-imports
  definePageMeta: 'readonly', defineNuxtPlugin: 'readonly',
  defineNuxtRouteMiddleware: 'readonly', defineNuxtConfig: 'readonly',
  defineEventHandler: 'readonly', readBody: 'readonly', getQuery: 'readonly',
  createError: 'readonly', sendError: 'readonly', getHeaders: 'readonly',
  getHeader: 'readonly', setCookie: 'readonly', getCookie: 'readonly',
  deleteCookie: 'readonly', getRequestIP: 'readonly',
  // Project composables (auto-imported)
  useAuth: 'readonly', useAuthApi: 'readonly', useUserSettings: 'readonly',
  useProjects: 'readonly', useKanban: 'readonly',
  // Nuxt fetch
  $fetch: 'readonly',
}

export default [
  {
    ignores: ['node_modules/**', '.nuxt/**', '.output/**', 'dist/**', 'coverage/**']
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...nuxtGlobals
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'vue/multi-word-component-names': 'off',
      // TypeScript handles undefined variables better than ESLint
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  },
  prettier
]
