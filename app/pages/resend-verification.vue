<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()

const email = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref('')

const resendVerification = async () => {
  if (!email.value || !email.value.includes('@')) {
    errorMessage.value = t('auth.validationError')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: { email: email.value }
    })

    if (res.status === 'success') {
      isSubmitted.value = true
    } else {
      errorMessage.value = t('auth.resendFailed')
    }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMessage.value = e?.data?.message || e?.message || t('auth.somethingWentWrong')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!-- Success state -->
  <UCard v-if="isSubmitted" class="rounded-3xl border-0 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 text-center">
    <template #header>
      <div class="flex flex-col items-center gap-3 pt-2">
        <div class="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
          <UIcon name="lucide:mail-check" class="size-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.verificationSent') }}</h1>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {{ t('auth.verificationEmailSent', { email }) }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-3 py-2">
      <UButton to="/login" variant="soft" color="primary" size="xl" class="w-full justify-center">
        <template #leading><UIcon name="lucide:log-in" /></template>
        {{ t('auth.backToLogin') }}
      </UButton>
      <UButton variant="outline" color="primary" size="xl" class="w-full justify-center" :loading="isSubmitting" @click="resendVerification">
        <template #leading><UIcon name="lucide:refresh-cw" /></template>
        {{ t('auth.sendAgain') }}
      </UButton>
    </div>
  </UCard>

  <!-- Form state -->
  <UCard v-else class="rounded-3xl border-0 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800">
    <template #header>
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('auth.resendVerification') }}</h1>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('auth.resendVerificationDescription') }}</p>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="resendVerification">
      <UFormField :label="t('auth.email')">
        <UInput
          v-model="email"
          type="email"
          size="xl"
          class="w-full"
          autocomplete="email"
          :placeholder="t('auth.placeholders.email')"
        />
      </UFormField>

      <UAlert v-if="errorMessage" color="error" variant="soft" :description="errorMessage" />

      <UButton type="submit" size="xl" class="w-full justify-center" :loading="isSubmitting">
        <template #leading><UIcon name="lucide:send" /></template>
        {{ isSubmitting ? t('auth.sending') : t('auth.sendVerificationEmail') }}
      </UButton>
    </form>

    <template #footer>
      <p class="text-center text-sm text-gray-600 dark:text-gray-300">
        {{ t('auth.rememberPassword') }}?
        <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
          {{ t('auth.backToLogin') }}
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
