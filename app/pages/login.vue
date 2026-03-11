<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const { t, setLocale } = useI18n()
const colorMode = useColorMode()
const { login } = useAuthApi()
const toast = useToast()

const form = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)

const submit = async () => {
  isSubmitting.value = true

  try {
    const response = await login({
      email: form.email,
      password: form.password
    })

    const payload = response.data

    if (payload.user?.language) {
      await setLocale(payload.user.language)
    }

    if (payload.user?.theme) {
      colorMode.preference = payload.user.theme
    }

    if (import.meta.client) {
      localStorage.setItem('access_token', payload.accessToken)
    }

    toast.add({
      title: t('common.success'),
      description: t('auth.loginSuccess'),
      color: 'success',
      icon: 'lucide:check-circle'
    })

    await navigateTo('/dashboard')
  } catch (error: any) {
    toast.add({
      title: t('auth.loginFailed'),
      description: error?.data?.error?.message || error?.data?.statusMessage || t('common.tryAgain'),
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

    <form class="space-y-4" @submit.prevent="submit">
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
            autocomplete="current-password"
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

      <UButton type="submit" class="w-full justify-center" size="xl" :loading="isSubmitting">
        {{ t('auth.continue') }}
      </UButton>
    </form>

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
