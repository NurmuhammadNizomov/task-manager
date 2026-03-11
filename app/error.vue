<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()
const { t } = useI18n()

const errorTitle = computed(() => {
  return props.error?.statusCode === 404 ? t('errorPage.notFoundTitle') : t('errorPage.title')
})

const errorMessage = computed(() => {
  if (props.error?.statusMessage) {
    return props.error.statusMessage
  }

  if (props.error?.statusCode === 404) {
    return t('errorPage.notFoundMessage')
  }

  return t('errorPage.defaultMessage')
})

const goHome = () => {
  clearError({ redirect: '/' })
}
</script>

<template>
  <UContainer class="py-16">
    <div class="mx-auto max-w-2xl">
      <UCard class="shadow-lg">
        <template #header>
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold">{{ errorTitle }}</h1>
            <UBadge color="error" variant="soft">
              {{ props.error?.statusCode || 500 }}
            </UBadge>
          </div>
        </template>

        <p class="text-gray-600 dark:text-gray-300">
          {{ errorMessage }}
        </p>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton color="primary" @click="goHome">
              {{ t('errorPage.backHome') }}
            </UButton>
            <UButton variant="outline" @click="clearError()">
              {{ t('errorPage.dismiss') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>
