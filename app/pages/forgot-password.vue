<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { t } = useI18n()
const { forgotPassword } = useAuthApi()
const toast = useToast()

const schema = z.object({
  email: z.string().email(t('auth.validation.invalidEmail'))
})

type Schema = z.infer<typeof schema>

const state = reactive({
  email: ''
})

const isSubmitting = ref(false)
const isSent = ref(false)

const submit = async (event: FormSubmitEvent<Schema>) => {
  isSubmitting.value = true
  try {
    await forgotPassword(event.data.email)
    isSent.value = true
    toast.add({
      title: t('auth.verificationSent'),
      description: t('auth.verificationEmailSent', { email: event.data.email }),
      color: 'success',
      icon: 'lucide:mail-check'
    })
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
          {{ isSent ? t('auth.checkYourEmail') : t('auth.resendVerificationDescription') }}
        </p>
      </div>
    </template>

    <div v-if="isSent" class="space-y-6 py-4 text-center">
      <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
        <Icon name="lucide:mail-check" class="size-8 text-primary-600 dark:text-primary-400" />
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('auth.spamFolderNote') }}
      </p>
      <UButton
        to="/login"
        size="xl"
        block
        color="neutral"
        variant="ghost"
      >
        {{ t('auth.backToLogin') }}
      </UButton>
    </div>

    <UForm v-else :schema="schema" :state="state" class="space-y-4" @submit="submit">
      <UFormField :label="t('auth.email')" name="email">
        <UInput
          v-model="state.email"
          type="email"
          size="xl"
          class="w-full"
          :placeholder="t('auth.placeholders.email')"
        />
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
