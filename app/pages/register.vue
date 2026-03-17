<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { DEFAULT_LANGUAGE } from '~/composables/useUserSettings'
import type { AppLanguage } from '~/composables/useUserSettings'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { t, locale } = useI18n()

// Schema for frontend validation
const schema = z.object({
  fullName: z.string().min(2, t('auth.validation.fullNameMin')),
  email: z.string().email(t('auth.validation.invalidEmail')),
  password: z.string().min(8, t('auth.validation.passwordMin')),
  confirmPassword: z.string().min(8, t('auth.validation.passwordMin'))
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.validation.passwordsDoNotMatch'),
  path: ['confirmPassword']
})

type Schema = z.infer<typeof schema>

useSeoMeta({
  title: () => t('auth.register'),
  description: () => t('auth.registerDescription') || t('auth.register'),
  ogTitle: () => t('auth.register'),
})
const colorMode = useColorMode()
const { register } = useAuthApi()
const { setAuth } = useAuth()
const toast = useToast()

const form = reactive<Schema>({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)

const normalizeLanguage = (value: string | null | undefined): AppLanguage => {
  if (!value) {
    return DEFAULT_LANGUAGE
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

const submit = async (event: FormSubmitEvent<Schema>) => {
  isSubmitting.value = true

  try {
    const selectedLanguage = normalizeLanguage(locale.value as string)

    await register({
      ...event.data,
      language: selectedLanguage
    })

    toast.add({
      title: t('common.success'),
      description: t('auth.registerSuccess'),
      color: 'success',
      icon: 'lucide:check-circle'
    })

    await navigateTo('/login')
  } catch (error: unknown) {
    let errorMessage = t('common.tryAgain')
    
    if (error && typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>
      if (errorObj.data && typeof errorObj.data === 'object') {
        const dataObj = errorObj.data as Record<string, unknown>
        errorMessage = (dataObj.error?.message || dataObj.statusMessage || dataObj.message) as string || errorMessage
      }
    }
    
    toast.add({
      title: t('auth.registerFailed'),
      description: errorMessage,
      color: 'error',
      icon: 'lucide:circle-alert'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UCard class="rounded-3xl border-0 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800">
    <template #header>
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.registerTitle') }}</h1>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('auth.registerSubtitle') }}</p>
      </div>
    </template>

    <UForm :schema="schema" :state="form" class="space-y-4" @submit="submit">
      <UFormField :label="t('auth.fullName')" name="fullName">
        <UInput
          v-model="form.fullName"
          size="xl"
          class="w-full"
          :placeholder="t('auth.placeholders.fullName')"
        />
      </UFormField>

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
          autocomplete="new-password"
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

      <UFormField :label="t('auth.confirmPassword')" name="confirmPassword">
        <UInput
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          size="xl"
          class="w-full"
          autocomplete="new-password"
          :placeholder="t('auth.placeholders.password')"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="ghost"
              :icon="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'"
              class="-mr-1.5"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        size="xl"
        block
        color="primary"
        class="rounded-xl font-semibold"
        :loading="isSubmitting"
      >
        {{ t('auth.createAccount') }}
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-center text-sm text-gray-600 dark:text-gray-300">
        {{ t('auth.alreadyHave') }}
        <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
          {{ t('auth.goToSignin') }}
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
