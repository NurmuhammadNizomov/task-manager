<script setup lang="ts">
const colorMode = useColorMode()
const { themeItems } = useUserSettings()
const { updatePreferences } = useAuthApi()

const currentTheme = computed(() => {
  return themeItems.value.find((item) => item.value === colorMode.preference) ?? themeItems.value[0]
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

const saveThemePreference = async (theme: 'system' | 'light' | 'dark') => {
  if (!import.meta.client) {
    return
  }

  const accessToken = localStorage.getItem('access_token')

  if (!accessToken) {
    return
  }

  try {
    await updatePreferences(accessToken, { theme })
  } catch {
    // Ignore preference sync errors in layout-level UI.
  }
}

watch(
  () => colorMode.preference,
  (value, oldValue) => {
    if (!value || value === oldValue) {
      return
    }

    void saveThemePreference(value as 'system' | 'light' | 'dark')
  }
)
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
  >
    <header class="sticky top-0 z-20 border-b border-gray-200/80 bg-white/80 backdrop-blur dark:border-gray-800/80 dark:bg-gray-950/80">
      <UContainer class="py-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <NuxtLink to="/" class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
              <Icon name="lucide:shield-check" class="text-primary-700 dark:text-primary-300" />
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-gray-500">Task Manager</p>
              <p class="text-lg font-semibold">Nuxt Auth Platform</p>
            </div>
          </NuxtLink>

          <UDropdownMenu :items="themeMenuItems" :content="{ side: 'bottom', align: 'end' }">
            <UButton
              variant="ghost"
              color="neutral"
              class="h-9 w-9 justify-center rounded-full"
              :aria-label="currentTheme?.label || 'Theme'"
            >
              <Icon :name="currentTheme?.icon || 'lucide:monitor'" class="size-5" />
            </UButton>
          </UDropdownMenu>
        </div>
      </UContainer>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
