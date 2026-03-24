<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
await navigateTo('/profile', { replace: true })
</script>

<template>
  <div />
</template>
