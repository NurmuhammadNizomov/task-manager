<script setup lang="ts">
import type { AppLanguage } from '~/types/auth'

const colorMode = useColorMode()
const { t, locale, setLocale } = useI18n()
const { languageItems, themeItems } = useUserSettings()
const { updatePreferences } = useAuthApi()

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

const currentLanguage = computed(() => {
  const language = normalizeLanguage(locale.value as string)
  return languageItems.value.find((item) => item.value === language) ?? languageItems.value[0]
})

const currentTheme = computed(() => {
  return themeItems.value.find((item) => item.value === colorMode.preference) ?? themeItems.value[0]
})

const savePreference = async (payload: { language?: AppLanguage; theme?: 'system' | 'light' | 'dark' }) => {
  if (!import.meta.client) {
    return
  }

  try {
    await updatePreferences(payload)
  } catch {
    // Ignore preference sync errors in header-level UI.
  }
}

const languageMenuItems = computed(() => {
  return languageItems.value.map((item) => ({
    label: item.label,
    onSelect: () => {
      void setLocale(item.value)
      void savePreference({ language: item.value })
    }
  }))
})

const themeMenuItems = computed(() => {
  return themeItems.value.map((item) => ({
    label: item.label,
    icon: item.icon,
    onSelect: () => {
      colorMode.preference = item.value
    }
  }))
})

watch(
  () => colorMode.preference,
  (value, oldValue) => {
    if (!value || value === oldValue) {
      return
    }

    void savePreference({ theme: value as 'system' | 'light' | 'dark' })
  }
)
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-gray-200/80 bg-white/80 backdrop-blur dark:border-gray-800/80 dark:bg-gray-950/80">
    <UContainer class="py-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 transition-all duration-200 group-hover:bg-primary-200 dark:bg-primary-900/40 dark:group-hover:bg-primary-900/60">
            <Icon name="lucide:shield-check" class="size-6 text-primary-700 dark:text-primary-300" />
          </div>
          <div class="flex flex-col">
            <p class="text-lg font-bold text-gray-900 dark:text-white leading-tight">{{ t('common.appName') }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-tight">{{ t('header.tagline') }}</p>
          </div>
        </NuxtLink>

        <div class="flex items-center gap-2">
          <UDropdownMenu :items="languageMenuItems" :content="{ side: 'bottom', align: 'end' }">
            <UButton
              variant="ghost"
              color="neutral"
              class="h-10 gap-2 px-3 font-medium text-sm"
              :aria-label="currentLanguage?.label || t('auth.language')"
            >
              <Icon name="lucide:languages" class="size-4" />
              <span class="uppercase">{{ currentLanguage?.value }}</span>
            </UButton>
          </UDropdownMenu>

          <UDropdownMenu :items="themeMenuItems" :content="{ side: 'bottom', align: 'end' }">
            <UButton
              variant="ghost"
              color="neutral"
              class="h-10 w-10 flex items-center justify-center rounded-full"
              :aria-label="currentTheme?.label || t('auth.theme')"
            >
              <Icon :name="currentTheme?.icon || 'lucide:monitor'" class="size-5" />
            </UButton>

            <template #item="{ item }">
              <div class="flex items-center gap-2 w-full">
                <Icon :name="item.icon" class="size-4 shrink-0" />
                <span class="text-sm font-medium">{{ item.label }}</span>
              </div>
            </template>
          </UDropdownMenu>
        </div>
      </div>
    </UContainer>
  </header>
</template>
