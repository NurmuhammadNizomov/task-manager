<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { t, setLocale } = useI18n()

const schema = z.object({
  email: z.string().email(t('auth.validation.invalidEmail')),
  password: z.string().min(8, t('auth.validation.passwordMin'))
})

type Schema = z.infer<typeof schema>

useSeoMeta({
  title: () => t('auth.login'),
  description: () => t('auth.loginDescription') || t('auth.login'),
  ogTitle: () => t('auth.login'),
})

const colorMode = useColorMode()
const { login } = useAuthApi()
const { setAuth } = useAuth()
const toast = useToast()
const config = useRuntimeConfig()

const form = reactive<Schema>({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)

const loginWithGoogle = () => {
  const params = new URLSearchParams({
    client_id: config.public.googleClientId as string,
    redirect_uri: config.public.googleRedirectUri as string,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline'
  })
  window.location.href = `https://accounts.google.com/o/oauth2/auth?${params}`
}

const submit = async (event: FormSubmitEvent<Schema>) => {
  isSubmitting.value = true
  try {
    const response = await login(event.data)
    const user = response.data.user
    if (user.language) await setLocale(user.language as string)
    if (user.theme) colorMode.preference = user.theme as string
    setAuth(user as Parameters<typeof setAuth>[0])
    toast.add({ title: t('common.success'), description: t('auth.loginSuccess'), color: 'success', icon: 'lucide:check-circle' })
    await navigateTo('/dashboard')
  } catch (error: unknown) {
    let errorMessage = t('common.tryAgain')
    if (error && typeof error === 'object') {
      const e = error as Record<string, unknown>
      if (e.data && typeof e.data === 'object') {
        const d = e.data as Record<string, unknown>
        errorMessage = (d.error?.message || d.statusMessage) as string || errorMessage
      }
    }
    toast.add({ title: t('auth.loginFailed'), description: errorMessage, color: 'error', icon: 'lucide:circle-alert' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UCard class="rounded-3xl border-0 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800">
    <template #header>
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.loginTitle') }}</h1>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('auth.loginSubtitle') }}</p>
      </div>
    </template>

    <UForm :schema="schema" :state="form" class="space-y-4" @submit="submit">
      <UFormField :label="t('auth.email')" name="email">
        <UInput
          v-model="form.email"
          type="email"
          size="xl"
          class="w-full"
          autocomplete="email"
          :placeholder="t('auth.placeholders.email')"
        />
      </UFormField>

      <UFormField :label="t('auth.password')" name="password">
        <UInput
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          size="xl"
          class="w-full"
          autocomplete="current-password"
          :placeholder="t('auth.placeholders.password')"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="ghost"
              :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
              class="-mr-1.5"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <div class="flex items-center justify-between">
        <UButton
          to="/forgot-password"
          variant="link"
          color="primary"
          class="px-0 text-sm font-medium"
        >
          {{ t('auth.forgot') }}
        </UButton>
      </div>

      <UButton
        type="submit"
        size="xl"
        block
        color="primary"
        class="font-semibold"
        :style="{ borderRadius: 'var(--radius-xl)' }"
        :loading="isSubmitting"
      >
        {{ t('auth.goToSignin') }}
      </UButton>
    </UForm>

    <div class="relative my-4">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t border-gray-200 dark:border-gray-700" />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-white dark:bg-gray-900 px-3 text-gray-400">{{ t('auth.orContinueWith') }}</span>
      </div>
    </div>

    <UButton
      block
      size="xl"
      color="neutral"
      variant="outline"
      class="font-semibold"
      :style="{ borderRadius: 'var(--radius-xl)' }"
      @click="loginWithGoogle"
    >
      <template #leading>
        <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </template>
      {{ t('auth.continueWithGoogle') }}
    </UButton>

    <template #footer>
      <p class="text-center"
        :style="{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-gray-600)'
        }"
      >
        {{ t('auth.newHere') }}
        <NuxtLink
          to="/register"
          class="font-medium hover:opacity-80 transition-opacity"
          :style="{ color: 'var(--color-primary-600)' }"
        >
          {{ t('auth.goToSignup') }}
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
