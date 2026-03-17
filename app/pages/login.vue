<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { t, setLocale } = useI18n()

// Schema for frontend validation
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

const form = reactive<Schema>({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)

const submit = async (event: FormSubmitEvent<Schema>) => {
  isSubmitting.value = true

  try {
    const response = await login(event.data)

    const payload = response.data

    if (payload.user?.language) {
      await setLocale(payload.user.language)
    }

    if (payload.user?.theme) {
      colorMode.preference = payload.user.theme
    }

    setAuth(payload.user)

    // Check if email is verified
    if (!payload.user.isEmailVerified) {
      toast.add({
        title: t('auth.securityNote'),
        description: t('auth.checkYourEmail'),
        color: 'warning',
        icon: 'lucide:mail'
      })
    } else {
      toast.add({
        title: t('common.success'),
        description: t('auth.loginSuccess'),
        color: 'success',
        icon: 'lucide:check-circle'
      })
    }

    await navigateTo('/dashboard')
  } catch (error: unknown) {
    let errorMessage = t('common.tryAgain')
    
    if (error && typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>
      if (errorObj.data && typeof errorObj.data === 'object') {
        const dataObj = errorObj.data as Record<string, unknown>
        errorMessage = (dataObj.error?.message || dataObj.statusMessage) as string || errorMessage
      }
    }
    
    toast.add({
      title: t('auth.loginFailed'),
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
        class="rounded-xl font-semibold"
        :loading="isSubmitting"
      >
        {{ t('auth.goToSignin') }}
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-center text-sm text-gray-600 dark:text-gray-300">
        {{ t('auth.newHere') }}
        <NuxtLink to="/register" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
          {{ t('auth.goToSignup') }}
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
