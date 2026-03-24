<script setup lang="ts">
import DefaultHeader from '~/components/layout/DefaultHeader.vue'
import DefaultFooter from '~/components/layout/DefaultFooter.vue'
import LoadingBar from '~/components/ui/LoadingBar.vue'
import ScrollToTop from '~/components/ui/ScrollToTop.vue'
import NotificationToast from '~/components/ui/NotificationToast.vue'

const nuxtApp = useNuxtApp()
const isLoading = ref(false)

nuxtApp.hook('page:start', () => {
  isLoading.value = true
})

nuxtApp.hook('page:finish', () => {
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

const { y } = useWindowScroll()
const route = useRoute()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>

    <LoadingBar :is-loading="isLoading" />

    <header class="relative z-40">
      <DefaultHeader />
    </header>

    <main id="main-content" class="flex-1 relative z-10">
      <Transition name="slide-fade" mode="out-in" appear>
        <div :key="route.path" class="w-full h-full">
          <slot />
        </div>
      </Transition>
    </main>

    <!-- Footer -->
    <footer class="relative z-20 mt-auto">
      <DefaultFooter />
    </footer>

    <!-- Scroll to Top Button -->
    <Transition name="bounce">
      <ScrollToTop v-if="y > 300" :visible="y > 300" />
    </Transition>

    <!-- Global Notification Container -->
    <ClientOnly>
      <NotificationToast />
    </ClientOnly>
  </div>
</template>

<style scoped>
@keyframes slide-fade-enter {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-fade-leave {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-30px); }
}

.slide-fade-enter-active { animation: slide-fade-enter 0.4s ease-out; }
.slide-fade-leave-active { animation: slide-fade-leave 0.4s ease-in; }

.bounce-enter-active,
.bounce-leave-active { transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }

.bounce-enter-from,
.bounce-leave-to { opacity: 0; transform: scale(0.3) translateY(20px); }
</style>
