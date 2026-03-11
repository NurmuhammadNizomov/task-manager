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
    class="min-h-screen bg-gray-100 dark:bg-gray-950"
  >
    <div class="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
      <aside class="w-full border-b border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:w-72 lg:border-b-0 lg:border-r">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
            <Icon name="lucide:layout-dashboard" class="text-primary-700 dark:text-primary-300" />
          </div>
          <div>
            <p class="text-xs uppercase tracking-wider text-gray-500">Task Manager</p>
            <p class="font-semibold">Dashboard</p>
          </div>
        </div>

        <nav class="mt-6 grid gap-2">
          <UButton variant="soft" color="primary" class="justify-start">
            <template #leading>
              <Icon name="lucide:home" />
            </template>
            Overview
          </UButton>
          <UButton variant="ghost" color="neutral" class="justify-start">
            <template #leading>
              <Icon name="lucide:check-square" />
            </template>
            Tasks
          </UButton>
          <UButton variant="ghost" color="neutral" class="justify-start">
            <template #leading>
              <Icon name="lucide:users" />
            </template>
            Team
          </UButton>
          <UButton variant="ghost" color="neutral" class="justify-start">
            <template #leading>
              <Icon name="lucide:settings" />
            </template>
            Settings
          </UButton>
        </nav>

        <div class="mt-6 flex flex-wrap gap-2 lg:mt-10">
          <UDropdownMenu :items="themeMenuItems" :content="{ side: 'bottom', align: 'start' }">
            <UButton
              variant="ghost"
              color="neutral"
              class="h-9 w-9 justify-center rounded-full"
              :aria-label="currentTheme?.label || 'Theme'"
            >
              <Icon :name="currentTheme?.icon || 'lucide:monitor'" class="size-5" />
            </UButton>
          </UDropdownMenu>

          <UButton to="/login" size="sm" variant="ghost" color="neutral">Log out</UButton>
        </div>
      </aside>

      <div class="flex-1 p-5 md:p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
