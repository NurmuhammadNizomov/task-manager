<script setup lang="ts">
interface Props {
  isLoading: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <Transition name="loading-bar">
    <div
      v-if="isLoading"
      class="fixed top-0 left-0 right-0 h-1 z-50"
    >
      <div 
        class="h-full bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400 animate-pulse"
        style="background-size: 200% 100%; animation: shimmer 1.5s infinite;"
      />
    </div>
  </Transition>
</template>

<style scoped>
.loading-bar-enter-active,
.loading-bar-leave-active {
  transition: opacity 0.3s ease;
}

.loading-bar-enter-from,
.loading-bar-leave-to {
  opacity: 0;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
