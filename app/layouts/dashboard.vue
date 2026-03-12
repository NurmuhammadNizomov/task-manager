<script setup lang="ts">
import type { AppLanguage } from '~/composables/useUserSettings'

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
    // Ignore preference sync errors in layout-level UI.
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
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950">
    <div class="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
      <aside class="w-full border-b border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:w-72 lg:border-b-0 lg:border-r">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
            <Icon name="lucide:layout-dashboard" class="text-primary-700 dark:text-primary-300" />
          </div>
          <div>
            <p class="text-xs uppercase tracking-wider text-gray-500">{{ t('common.appName') }}</p>
            <p class="font-semibold">{{ t('dashboard.sidebarTitle') }}</p>
          </div>
        </div>

        <nav class="mt-6 grid gap-2">
          <UButton variant="soft" color="primary" class="justify-start">
            <template #leading>
              <Icon name="lucide:home" />
            </template>
            {{ t('dashboard.overview') }}
          </UButton>
          <UButton variant="ghost" color="neutral" class="justify-start">
            <template #leading>
              <Icon name="lucide:check-square" />
            </template>
            {{ t('dashboard.nav.tasks') }}
          </UButton>
          <UButton variant="ghost" color="neutral" class="justify-start">
            <template #leading>
              <Icon name="lucide:users" />
            </template>
            {{ t('dashboard.nav.team') }}
          </UButton>
          <UButton variant="ghost" color="neutral" class="justify-start">
            <template #leading>
              <Icon name="lucide:settings" />
            </template>
            {{ t('dashboard.nav.settings') }}
          </UButton>
        </nav>

        <div class="mt-6 flex flex-wrap items-center gap-2 lg:mt-10">
          <UDropdownMenu :items="languageMenuItems" :content="{ side: 'bottom', align: 'start' }">
            <UButton
              variant="ghost"
              color="neutral"
              class="h-9 gap-1 px-2"
              :aria-label="currentLanguage?.label || t('auth.language')"
            >
              <Icon name="lucide:languages" class="size-4" />
              <span class="text-xs font-semibold uppercase">{{ currentLanguage?.value }}</span>
            </UButton>
          </UDropdownMenu>

          <UDropdownMenu :items="themeMenuItems" :content="{ side: 'bottom', align: 'start' }">
            <UButton
              variant="ghost"
              color="neutral"
              class="h-9 w-9 justify-center rounded-full"
              :aria-label="currentTheme?.label || t('auth.theme')"
            >
              <Icon :name="currentTheme?.icon || 'lucide:monitor'" class="size-5" />
            </UButton>
          </UDropdownMenu>

          <UButton to="/login" size="sm" variant="ghost" color="neutral">{{ t('dashboard.actions.logout') }}</UButton>
        </div>
      </aside>

      <div class="flex-1 p-5 md:p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
