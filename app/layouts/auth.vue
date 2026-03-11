<script setup lang="ts">
import DefaultHeader from '~/components/layout/DefaultHeader.vue'
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900"
  >
    <DefaultHeader />

    <UContainer class="flex min-h-[calc(100vh-73px)] items-center justify-center py-8">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </UContainer>
  </div>
</template>
