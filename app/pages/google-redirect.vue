<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t, setLocale } = useI18n()
const { setAuth } = useAuth()
const colorMode = useColorMode()
const toast = useToast()
const route = useRoute()

const status = ref<'loading' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code as string
  const error = route.query.error as string

  if (error || !code) {
    status.value = 'error'
    errorMessage.value = t('auth.googleAuthError')
    setTimeout(() => navigateTo('/login'), 2000)
    return
  }

  try {
    const result = await $fetch<{ data: { user: Record<string, unknown> } }>('/api/auth/google-callback', {
      method: 'POST',
      body: { code }
    })

    const user = result.data.user
    if (user.language) await setLocale(user.language as string)
    if (user.theme) colorMode.preference = user.theme as string
    setAuth(user as Parameters<typeof setAuth>[0])

    toast.add({
      title: t('common.success'),
      description: t('auth.loginSuccess'),
      color: 'success',
      icon: 'lucide:check-circle'
    })

    await navigateTo('/dashboard')
  } catch (err: unknown) {
    console.error('[Google Callback Error]', err)
    status.value = 'error'
    let msg = t('common.tryAgain')
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>
      if (e.data && typeof e.data === 'object') {
        const d = e.data as Record<string, unknown>
        msg = (d.error?.message || d.statusMessage) as string || msg
      }
    }
    errorMessage.value = msg
    setTimeout(() => navigateTo('/login'), 3000)
  }
})
</script>

<template>
  <UCard class="rounded-3xl border-0 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800">
    <div class="flex flex-col items-center gap-4 py-8">
      <template v-if="status === 'loading'">
        <UIcon name="lucide:loader-circle" class="w-10 h-10 animate-spin text-primary-500" />
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('common.loading') }}</p>
      </template>
      <template v-else>
        <UIcon name="lucide:circle-alert" class="w-10 h-10 text-red-500" />
        <p class="text-sm text-red-500">{{ errorMessage }}</p>
        <p class="text-xs text-gray-400">{{ t('auth.backToLogin') }}...</p>
      </template>
    </div>
  </UCard>
</template>
