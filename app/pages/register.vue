<script setup lang="ts">
import { DEFAULT_LANGUAGE, DEFAULT_THEME } from '~/composables/useUserSettings'
import type { AppLanguage, AppTheme } from '~/composables/useUserSettings'

definePageMeta({
  layout: 'auth'
})

const { t, locale } = useI18n()
const colorMode = useColorMode()
const { register } = useAuthApi()
const { themeItems } = useUserSettings()
const toast = useToast()

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  theme: DEFAULT_THEME as AppTheme
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)

const normalizeSelectValue = <T extends string>(value: T | { value?: T } | null | undefined): T | null => {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && typeof value.value === 'string') {
    return value.value
  }

  return null
}

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

watch(
  () => form.theme,
  (value) => {
    const nextTheme = normalizeSelectValue(value)

    if (!nextTheme) {
      return
    }

    if (form.theme !== nextTheme) {
      form.theme = nextTheme as AppTheme
    }

    colorMode.preference = nextTheme
  }
)

const submit = async () => {
  isSubmitting.value = true

  try {
    if (form.password !== form.confirmPassword) {
      toast.add({
        title: t('auth.validationError'),
        description: t('auth.passwordsDoNotMatch'),
        color: 'error',
        icon: 'lucide:circle-alert'
      })
      isSubmitting.value = false
      return
    }

    const selectedLanguage = normalizeLanguage(locale.value as string)
    const selectedTheme = normalizeSelectValue(form.theme) ?? DEFAULT_THEME

    await register({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      language: selectedLanguage,
      theme: selectedTheme
    })

    toast.add({
      title: t('common.success'),
      description: t('auth.registerSuccess'),
      color: 'success',
      icon: 'lucide:check-circle'
    })

    await navigateTo('/login')
  } catch (error: any) {
    toast.add({
      title: t('auth.registerFailed'),
      description:
        error?.data?.error?.message || error?.data?.statusMessage || error?.message || t('common.tryAgain'),
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

    <form class="space-y-4" @submit.prevent="submit">
      <UFormField :label="t('auth.fullName')">
        <UInput v-model="form.fullName" size="xl" class="w-full" autocomplete="name" :placeholder="t('auth.placeholders.fullName')" />
      </UFormField>

      <UFormField :label="t('auth.email')">
        <UInput
          v-model="form.email"
          type="email"
          size="xl"
          class="w-full"
          autocomplete="email"
          :placeholder="t('auth.placeholders.email')"
        />
      </UFormField>

      <UFormField :label="t('auth.password')">
        <div class="relative">
          <UInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            size="xl"
            class="w-full pe-10"
            autocomplete="new-password"
            :placeholder="t('auth.placeholders.password')"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 grid w-10 place-items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="showPassword = !showPassword"
          >
            <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" />
          </button>
        </div>
      </UFormField>

      <UFormField :label="t('auth.confirmPassword')">
        <div class="relative">
          <UInput
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            size="xl"
            class="w-full pe-10"
            autocomplete="new-password"
            :placeholder="t('auth.placeholders.password')"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 grid w-10 place-items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" />
          </button>
        </div>
      </UFormField>

      <UFormField :label="t('auth.theme')">
        <USelect
          v-model="form.theme"
          :items="themeItems"
          value-key="value"
          label-key="label"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" class="w-full justify-center" size="xl" :loading="isSubmitting">
        {{ t('auth.createAccount') }}
      </UButton>
    </form>

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
