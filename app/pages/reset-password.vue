<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { t } = useI18n()
const { resetPassword } = useAuthApi()
const route = useRoute()
const toast = useToast()

const schema = z.object({
  password: z.string().min(8, t('auth.validation.passwordMin')),
  confirmPassword: z.string().min(8, t('auth.validation.passwordMin'))
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.validation.passwordsDoNotMatch'),
  path: ['confirmPassword']
})

type Schema = z.infer<typeof schema>

const state = reactive({
  password: '',
  confirmPassword: ''
})

const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const token = route.query.token as string

const submit = async (event: FormSubmitEvent<Schema>) => {
  if (!token) {
    toast.add({
      title: t('auth.verificationTokenRequired'),
      description: t('auth.verificationTokenMissing'),
      color: 'error',
      icon: 'lucide:circle-alert'
    })
    return
  }

  isSubmitting.value = true
  try {
    await resetPassword({
      token,
      password: event.data.password
    })
    toast.add({
      title: t('common.success'),
      description: t('auth.resetPasswordSuccess'),
      color: 'success',
      icon: 'lucide:check-circle'
    })
    await navigateTo('/login')
  } catch (error: any) {
    toast.add({
      title: t('auth.somethingWentWrong'),
      description: error.data?.message || t('common.tryAgain'),
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
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.resetPassword') }}</h1>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ t('auth.resendVerificationDescription') }}
        </p>
      </div>
    </template>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="submit">
      <UFormField :label="t('auth.password')" name="password">
        <UInput
          v-model="state.password"
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
          v-model="state.confirmPassword"
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
        {{ t('auth.resetPassword') }}
      </UButton>

      <UButton
        to="/login"
        size="xl"
        block
        color="neutral"
        variant="ghost"
      >
        {{ t('auth.backToLogin') }}
      </UButton>
    </UForm>
  </UCard>
</template>
