<script setup lang="ts">
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
  </UContainer>
</template>
