<script setup lang="ts">
import DefaultHeader from '~/components/layout/DefaultHeader.vue'
import DefaultFooter from '~/components/layout/DefaultFooter.vue'
import LoadingBar from '~/components/ui/LoadingBar.vue'
import ScrollToTop from '~/components/ui/ScrollToTop.vue'
import NotificationToast from '~/components/ui/NotificationToast.vue'
import GlobalLoader from '~/components/ui/GlobalLoader.vue'

// Page loading state
const nuxtApp = useNuxtApp()
const isLoading = ref(false)
const isTransitioning = ref(false)

// Handle page loading states
nuxtApp.hook('page:start', () => {
  isLoading.value = true
})

nuxtApp.hook('page:finish', () => {
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

// Scroll behavior
const { y } = useWindowScroll()
const scrollProgress = computed(() => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  return Math.min((y.value / maxScroll) * 100, 100)
})

// Meta tags and SEO
useHead({
  htmlAttrs: {
    lang: 'en'
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'theme-color', content: '#3b82f6' },
    { name: 'description', content: 'Professional task management platform with modern UI/UX' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
  ]
})

// Theme and color scheme
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// Animated background
const bgGradient = computed(() => {
  if (isDark.value) {
    return 'from-slate-900 via-purple-900/20 to-slate-900'
  }
  return 'from-blue-50 via-indigo-50/30 to-purple-50'
})

// Page transition system
const pageTransition = ref('slide-fade')
const route = useRoute()

// Watch route changes for transitions
watch(() => route.path, () => {
  isTransitioning.value = true
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
})
</script>

<template>
  <div 
    class="relative min-h-screen flex flex-col overflow-hidden"
    :class="[
      'transition-all duration-500 ease-in-out',
      isDark ? 'dark' : 'light'
    ]"
  >
    <!-- Animated Background -->
    <div class="fixed inset-0 pointer-events-none">
      <div 
        class="absolute inset-0 opacity-30"
        :class="[
          'bg-gradient-to-br transition-all duration-1000',
          bgGradient
        ]"
      />
      
      <!-- Animated particles -->
      <div class="absolute inset-0">
        <div 
          v-for="i in 20" 
          :key="i"
          class="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
          :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }"
        />
      </div>
    </div>

    <!-- Progress Bar -->
    <div 
      class="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50 transition-all duration-300"
      :style="{ width: `${scrollProgress}%` }"
    />

    <!-- Skip to main content for accessibility -->
    <a 
      href="#main-content" 
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 transform transition-all duration-300 hover:scale-105"
    >
      Skip to main content
    </a>

    <!-- Global Loading Overlay -->
    <Transition name="fade">
      <GlobalLoader v-if="isLoading" />
    </Transition>

    <!-- Loading Bar -->
    <LoadingBar :is-loading="isLoading" />

    <!-- Header -->
    <header class="relative z-40">
      <div class="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent dark:from-slate-900/80 dark:to-transparent" />
      <DefaultHeader />
    </header>

    <!-- Main Content -->
    <main 
      id="main-content"
      class="flex-1 relative z-10"
      :class="[
        'transition-all duration-500 ease-in-out',
        isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
      ]"
    >
      <!-- Page Transition Container -->
      <Transition 
        :name="pageTransition"
        mode="out-in"
        appear
      >
        <div 
          key="route.path"
          class="w-full h-full"
        >
          <slot />
        </div>
      </Transition>
    </main>

    <!-- Footer -->
    <footer class="relative z-20 mt-auto">
      <div class="absolute inset-0 bg-gradient-to-t from-transparent to-white/60 dark:to-slate-900/60" />
      <DefaultFooter />
    </footer>

    <!-- Scroll to Top Button -->
    <Transition name="bounce">
      <ScrollToTop 
        v-if="y > 300" 
        :visible="y > 300"
      />
    </Transition>

    <!-- Global Notification Container -->
    <ClientOnly>
      <NotificationToast />
    </ClientOnly>

    <!-- Global Overlays -->
    <Teleport to="body">
      <div id="overlays-container" class="fixed inset-0 pointer-events-none z-50">
        <!-- Dynamic overlays will be teleported here -->
      </div>
    </Teleport>

    <!-- Ambient Effects -->
    <div class="fixed inset-0 pointer-events-none">
      <!-- Gradient orbs -->
      <div 
        v-for="i in 3" 
        :key="`orb-${i}`"
        class="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        :class="[
          i === 0 ? 'bg-blue-400' : i === 1 ? 'bg-purple-400' : 'bg-pink-400',
          'animate-bounce'
        ]"
        :style="{
          left: `${-200 + i * 400}px`,
          top: `${-200 + i * 300}px`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${8 + i * 2}s`
        }"
      />
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes slide-fade-enter {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-fade-leave {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}

.slide-fade-enter-active {
  animation: slide-fade-enter 0.4s ease-out;
}

.slide-fade-leave-active {
  animation: slide-fade-leave 0.4s ease-in;
}

/* Fade transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Bounce transition */
.bounce-enter-active,
.bounce-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.bounce-enter-from,
.bounce-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(20px);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: linear-gradient(to bottom, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #9333ea);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #7c3aed);
}

/* Focus styles */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 0 0 6px rgba(59, 130, 246, 0.1);
}

.dark *:focus-visible {
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.3), 0 0 0 6px rgba(147, 51, 234, 0.1);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Glassmorphism effects */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
