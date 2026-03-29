<script setup lang="ts">
import type { AppLanguage } from '~/composables/useUserSettings'
import NotificationDropdown from '~/components/layout/NotificationDropdown.vue'

const colorMode = useColorMode()
const { logout } = useAuth()

const { t, locale, setLocale } = useI18n()
const { languageItems, themeItems } = useUserSettings()
const { updatePreferences } = useAuthApi()

const isMobileSidebarOpen = ref(false)

const normalizeLanguage = (value: string | null | undefined): AppLanguage => {
  if (!value) return 'en'
  const normalized = value.toLowerCase()
  if (normalized.startsWith('ru')) return 'ru'
  if (normalized.startsWith('uz')) return 'uz'
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
  if (!import.meta.client) return
  try {
    await updatePreferences(payload)
  } catch (_) { /* ignore */ }
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
    onSelect: () => { colorMode.preference = item.value }
  }))
})

watch(() => colorMode.preference, (value, oldValue) => {
  if (!value || value === oldValue) return
  void savePreference({ theme: value as 'system' | 'light' | 'dark' })
})

const { user } = useAuth()
watch(user, (u) => {
  if (!u) return
  if (u.language) void setLocale(u.language)
  if (u.theme) colorMode.preference = u.theme
}, { immediate: true })

const route = useRoute()
watch(() => route.path, () => { isMobileSidebarOpen.value = false })

const navLinks = computed(() => [
  { to: '/dashboard', icon: 'lucide:home', label: t('dashboard.overview') },
  { to: '/tasks', icon: 'lucide:check-square', label: t('dashboard.nav.tasks') },
  { to: '/team', icon: 'lucide:users', label: t('dashboard.nav.team') },
  { to: '/profile', icon: 'lucide:user', label: t('dashboard.nav.profile') }
])

const isActive = (path: string) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950">
    <!-- Mobile Header Bar -->
    <div class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
          <Icon name="lucide:layout-dashboard" class="size-4 text-primary-700 dark:text-primary-300" />
        </div>
        <span class="font-semibold text-gray-900 dark:text-white">{{ t('common.appName') }}</span>
      </div>
      <UButton variant="ghost" color="neutral" size="sm" @click="isMobileSidebarOpen = true">
        <Icon name="lucide:menu" class="size-5" />
      </UButton>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        @click="isMobileSidebarOpen = false"
      />
    </Transition>

    <!-- Mobile Sidebar Drawer -->
    <Transition
      enter-active-class="transition-transform duration-200"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="isMobileSidebarOpen"
        class="fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:hidden"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
              <Icon name="lucide:layout-dashboard" class="text-primary-700 dark:text-primary-300" />
            </div>
            <div>
              <p class="text-xs uppercase tracking-wider text-gray-500">{{ t('common.appName') }}</p>
              <p class="font-semibold">{{ t('dashboard.sidebarTitle') }}</p>
            </div>
          </div>
          <UButton variant="ghost" color="neutral" size="sm" @click="isMobileSidebarOpen = false">
            <Icon name="lucide:x" class="size-4" />
          </UButton>
        </div>

        <nav class="grid gap-1.5">
          <UButton
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :variant="isActive(link.to) ? 'soft' : 'ghost'"
            :color="isActive(link.to) ? 'primary' : 'neutral'"
            class="justify-start"
          >
            <template #leading><Icon :name="link.icon" /></template>
            {{ link.label }}
          </UButton>
        </nav>

        <div class="mt-6 flex flex-wrap items-center gap-2">
          <NotificationDropdown />
          <UDropdownMenu :items="languageMenuItems" :content="{ side: 'bottom', align: 'start' }">
            <UButton variant="ghost" color="neutral" class="h-9 gap-1 px-2" :aria-label="currentLanguage.label">
              <Icon name="lucide:languages" class="size-4" />
              <span class="text-xs font-semibold uppercase">{{ currentLanguage.value }}</span>
            </UButton>
          </UDropdownMenu>
          <UDropdownMenu :items="themeMenuItems" :content="{ side: 'bottom', align: 'start' }">
            <UButton variant="ghost" color="neutral" class="h-9 w-9 flex items-center justify-center rounded-full">
              <Icon :name="currentTheme.icon" class="size-5" />
            </UButton>
            <template #item="{ item }">
              <div class="flex items-center gap-2 w-full">
                <Icon :name="item.icon" class="size-4 shrink-0" />
                <span class="truncate">{{ item.label }}</span>
              </div>
            </template>
          </UDropdownMenu>
          <UButton size="sm" variant="ghost" color="neutral" @click="logout">{{ t('dashboard.actions.logout') }}</UButton>
        </div>
      </aside>
    </Transition>

    <div class="flex h-screen w-full flex-col lg:flex-row overflow-hidden">
      <!-- Desktop Sidebar -->
      <aside class="hidden w-72 shrink-0 border-r border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:flex lg:flex-col h-screen sticky top-0">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
            <Icon name="lucide:layout-dashboard" class="text-primary-700 dark:text-primary-300" />
          </div>
          <div>
            <p class="text-xs uppercase tracking-wider text-gray-500">{{ t('common.appName') }}</p>
            <p class="font-semibold">{{ t('dashboard.sidebarTitle') }}</p>
          </div>
        </div>

        <nav class="mt-6 grid gap-1.5">
          <UButton
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :variant="isActive(link.to) ? 'soft' : 'ghost'"
            :color="isActive(link.to) ? 'primary' : 'neutral'"
            class="justify-start"
          >
            <template #leading><Icon :name="link.icon" /></template>
            {{ link.label }}
          </UButton>
        </nav>

        <div class="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <NotificationDropdown />
          <UDropdownMenu :items="languageMenuItems" :content="{ side: 'bottom', align: 'start' }">
            <UButton variant="ghost" color="neutral" class="h-9 gap-1 px-2" :aria-label="currentLanguage.label">
              <Icon name="lucide:languages" class="size-4" />
              <span class="text-xs font-semibold uppercase">{{ currentLanguage.value }}</span>
            </UButton>
          </UDropdownMenu>
          <UDropdownMenu :items="themeMenuItems" :content="{ side: 'bottom', align: 'start' }">
            <UButton variant="ghost" color="neutral" class="h-9 w-9 flex items-center justify-center rounded-full">
              <Icon :name="currentTheme.icon" class="size-5" />
            </UButton>
            <template #item="{ item }">
              <div class="flex items-center gap-2 w-full">
                <Icon :name="item.icon" class="size-4 shrink-0" />
                <span class="truncate">{{ item.label }}</span>
              </div>
            </template>
          </UDropdownMenu>
          <UButton size="sm" variant="ghost" color="neutral" @click="logout">{{ t('dashboard.actions.logout') }}</UButton>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <slot />
      </main>
    </div>

  </div>
</template>
