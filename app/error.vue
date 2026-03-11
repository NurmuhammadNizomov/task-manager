<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

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
            <h1 class="text-2xl font-semibold">Something went wrong</h1>
            <UBadge color="error" variant="soft">
              {{ props.error?.statusCode || 500 }}
            </UBadge>
          </div>
        </template>

        <p class="text-gray-600 dark:text-gray-300">
          {{ props.error?.statusMessage || 'Unexpected error occurred.' }}
        </p>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton color="primary" @click="goHome">
              Back to Home
            </UButton>
            <UButton variant="outline" @click="clearError()">
              Dismiss
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>
