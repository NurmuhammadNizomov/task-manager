<script setup lang="ts">
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <Transition name="scroll-to-top">
    <button
      v-if="visible"
      @click="scrollToTop"
      class="fixed z-40 p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none"
      :style="{
        bottom: '2rem',
        right: '2rem',
        backgroundColor: 'var(--color-primary-600)',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-lg)'
      }"
      aria-label="Scroll to top"
    >
      <Icon name="lucide:arrow-up" :style="{ fontSize: 'var(--font-size-lg)' }" />
    </button>
  </Transition>
</template>

<style scoped>
.scroll-to-top-enter-active,
.scroll-to-top-leave-active {
  transition: all var(--duration-300) ease;
}

.scroll-to-top-enter-from,
.scroll-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
</style>
