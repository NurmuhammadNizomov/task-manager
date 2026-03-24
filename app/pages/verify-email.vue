<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const route = useRoute()
const { setAuth } = useAuth()
const { t } = useI18n()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const token = String(route.query.token || '')

  if (!token) {
    status.value = 'error'
    errorMessage.value = t('auth.verificationTokenMissing')
    return
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  try {
    const res = await $fetch(`/api/auth/verify-email?token=${token}`)

    if (res.status === 'success') {
      setAuth(res.data.user)
      status.value = 'success'
      setTimeout(() => { void navigateTo('/dashboard') }, 2000)
    } else {
      status.value = 'error'
      errorMessage.value = t('auth.verificationFailed')
    }
  } catch (err: unknown) {
    status.value = 'error'
    const e = err as { data?: { message?: string }; message?: string }
    errorMessage.value = e?.data?.message || e?.message || t('auth.verificationLinkInvalid')
  }
})
</script>

<template>
  <!-- Loading -->
  <UCard v-if="status === 'loading'" class="rounded-3xl border-0 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 text-center">
    <template #header>
      <div class="flex flex-col items-center gap-3 pt-2">
        <div class="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4">
          <UIcon name="lucide:mail" class="size-8 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.verifyingEmail') }}</h1>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ t('auth.pleaseWait') }}</p>
        </div>
      </div>
    </template>

    <div class="py-2 flex flex-col items-center gap-4">
      <UProgress animation="carousel" class="w-full" />
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('auth.checkingEmail') }}</p>
    </div>
  </UCard>

  <!-- Success -->
  <UCard v-else-if="status === 'success'" class="rounded-3xl border-0 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 text-center">
    <template #header>
      <div class="flex flex-col items-center gap-3 pt-2">
        <div class="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
          <UIcon name="lucide:check-circle" class="size-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.emailVerified') }}</h1>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ t('auth.welcomeAboard') }}</p>
        </div>
      </div>
    </template>

    <div class="py-2 space-y-4">
      <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('auth.emailVerifiedSuccess') }}</p>
      <div class="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
        <UIcon name="lucide:loader" class="size-4 animate-spin" />
        {{ t('auth.redirectingToDashboard') }}...
      </div>
    </div>
  </UCard>

  <!-- Error -->
  <UCard v-else class="rounded-3xl border-0 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 text-center">
    <template #header>
      <div class="flex flex-col items-center gap-3 pt-2">
        <div class="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
          <UIcon name="lucide:alert-circle" class="size-8 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.verificationFailed') }}</h1>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ errorMessage }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-3 py-2">
      <UButton to="/login" variant="soft" color="primary" size="xl" class="w-full justify-center">
        <template #leading><UIcon name="lucide:log-in" /></template>
        {{ t('auth.backToLogin') }}
      </UButton>
      <UButton to="/resend-verification" variant="outline" color="primary" size="xl" class="w-full justify-center">
        <template #leading><UIcon name="lucide:refresh-cw" /></template>
        {{ t('auth.resendEmail') }}
      </UButton>
    </div>

    <template #footer>
      <p class="text-center text-sm text-gray-500 dark:text-gray-400">
        {{ t('auth.needHelp') }}?
        <NuxtLink to="/support" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-1">
          {{ t('common.contactSupport') }}
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
