<script setup lang="ts">
import type { AppLanguage } from '~/composables/useUserSettings'

const { t, locale, setLocale } = useI18n()
const { languageItems } = useUserSettings()

const normalizeLanguage = (value: string | null | undefined): AppLanguage => {
  if (!value) {
    return 'en'
  }

  const normalized = value.toLowerCase()

  if (normalized.startsWith('ru')) {
    return 'ru'
  }

  if (normalized.startsWith('uz')) {
    return 'uz'
  }

  return 'en'
}

const selectedLanguage = ref<AppLanguage>(normalizeLanguage(locale.value as string))

const normalizeSelectValue = <T extends string>(value: T | { value?: T } | null | undefined): T | null => {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && typeof value.value === 'string') {
    return value.value
  }

  return null
}

watch(
  () => locale.value,
  (value) => {
    const nextLocale = normalizeLanguage(normalizeSelectValue(value))

    if (selectedLanguage.value !== nextLocale) {
      selectedLanguage.value = nextLocale
    }
  }
)

watch(selectedLanguage, async (value) => {
  const nextLocale = normalizeLanguage(normalizeSelectValue(value))

  if (locale.value === nextLocale) {
    return
  }

  await setLocale(nextLocale)
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900"
  >
    <header class="border-b border-gray-200/70 bg-white/70 backdrop-blur dark:border-gray-800 dark:bg-gray-950/50">
      <UContainer class="flex items-center justify-between py-4">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400"
        >
          <Icon name="lucide:arrow-left" />
          {{ t('common.home') }}
        </NuxtLink>

        <div class="w-36">
          <USelect
            v-model="selectedLanguage"
            :items="languageItems"
            value-key="value"
            label-key="label"
            size="sm"
            class="w-full"
          />
        </div>
      </UContainer>
    </header>

    <UContainer class="flex min-h-[calc(100vh-73px)] items-center justify-center py-8">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </UContainer>
  </div>
</template>
