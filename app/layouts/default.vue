<script setup lang="ts">
import DefaultHeader from '~/components/layout/DefaultHeader.vue'
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
  >
    <DefaultHeader />

    <main>
      <slot />
    </main>
  </div>
</template>
