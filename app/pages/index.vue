<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const { t } = useI18n()
</script>

<template>
  <UContainer class="py-12 md:py-16">
    <section class="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <UBadge color="primary" variant="soft" class="mb-4">{{ t('home.badge') }}</UBadge>
        <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
          {{ t('home.title') }}
        </h1>
        <p class="mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
          {{ t('home.description') }}
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <UButton to="/login" size="lg">{{ t('home.actions.login') }}</UButton>
          <UButton to="/register" size="lg" variant="outline">{{ t('home.actions.register') }}</UButton>
          <UButton to="/dashboard" size="lg" variant="soft" color="neutral">{{ t('home.actions.openDashboard') }}</UButton>
        </div>
      </div>

      <UCard class="overflow-hidden border-0 shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
        <div class="rounded-2xl bg-gradient-to-br from-primary-500/15 via-blue-500/10 to-cyan-500/15 p-6 md:p-8">
          <div class="grid gap-4">
            <div class="rounded-xl bg-white/90 p-4 dark:bg-gray-900/80">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">{{ t('home.stats.activeUsers') }}</p>
                <Icon name="lucide:users" class="text-primary-600" />
              </div>
              <p class="mt-2 text-2xl font-semibold">1,284</p>
            </div>

            <div class="rounded-xl bg-white/90 p-4 dark:bg-gray-900/80">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">{{ t('home.stats.tasksCompleted') }}</p>
                <Icon name="lucide:check-check" class="text-primary-600" />
              </div>
              <p class="mt-2 text-2xl font-semibold">92%</p>
            </div>

            <div class="rounded-xl bg-white/90 p-4 dark:bg-gray-900/80">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">{{ t('home.stats.systemStatus') }}</p>
                <Icon name="lucide:activity" class="text-green-600" />
              </div>
              <p class="mt-2 text-2xl font-semibold">{{ t('home.stats.healthy') }}</p>
            </div>
          </div>
        </div>
      </UCard>
    </section>

    <section class="mt-24 md:mt-32">
      <div class="mb-12 text-center transform transition-all duration-500 hover:scale-[1.02]">
        <UBadge color="primary" variant="subtle" class="mb-4">{{ t('home.features.label') || 'Features' }}</UBadge>
        <h2 class="text-3xl font-bold tracking-tight md:text-5xl text-gray-900 dark:text-white">
          {{ t('home.features.heading') || 'Crafted for Modern Web' }}
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          {{ t('home.features.subheading') || 'A completely responsive, dynamic, and stunning application structure ready for your next big idea.' }}
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <!-- Feature 1 -->
        <UCard class="group relative overflow-hidden rounded-3xl border border-gray-200/50 bg-white/40 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/40">
          <div class="flex flex-col items-center text-center pt-2">
            <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 dark:bg-primary-900/40">
              <Icon name="lucide:zap" class="size-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900 dark:text-white">{{ t('home.features.speed.title') || 'Lightning Fast' }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('home.features.speed.desc') || 'Optimized performance resulting in zero load times and snappy interactions.' }}
            </p>
          </div>
        </UCard>

        <!-- Feature 2 -->
        <UCard class="group relative overflow-hidden rounded-3xl border border-gray-200/50 bg-white/40 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/40">
          <div class="flex flex-col items-center text-center pt-2">
            <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 dark:bg-cyan-900/40">
              <Icon name="lucide:shield-check" class="size-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900 dark:text-white">{{ t('home.features.secure.title') || 'Secure by Default' }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('home.features.secure.desc') || 'Advanced security protocols out of the box to protect your sensitive data and keep your app safe.' }}
            </p>
          </div>
        </UCard>

        <!-- Feature 3 -->
        <UCard class="group relative overflow-hidden rounded-3xl border border-gray-200/50 bg-white/40 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/40">
          <div class="flex flex-col items-center text-center pt-2">
            <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 dark:bg-purple-900/40">
              <Icon name="lucide:layout-template" class="size-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-900 dark:text-white">{{ t('home.features.design.title') || 'Beautiful UI' }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('home.features.design.desc') || 'Crafted with attention to detail and a strong focus on modern design aesthetics and experience.' }}
            </p>
          </div>
        </UCard>
      </div>
    </section>
  </UContainer>
</template>
