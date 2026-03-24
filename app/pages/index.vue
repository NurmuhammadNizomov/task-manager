<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const { t } = useI18n()

const { public: { appBaseUrl } } = useRuntimeConfig()

useSeoMeta({
  title: () => t('home.title'),
  description: () => t('home.description'),
  ogTitle: () => t('home.title'),
  ogDescription: () => t('home.description'),
  ogUrl: appBaseUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  robots: 'index, follow'
})

useHead({
  link: [{ rel: 'canonical', href: appBaseUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Task Manager',
        description: t('home.description'),
        url: appBaseUrl,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      })
    }
  ]
})

const highlights = computed(() => [
  t('home.highlights.tasks'),
  t('home.highlights.team'),
  t('home.highlights.secure')
])
</script>

<template>
  <!-- Hero Section -->
  <UContainer class="py-12 md:py-20">
    <section class="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 class="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
          {{ t('home.title') }}
        </h1>
        <p class="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-300">
          {{ t('home.description') }}
        </p>

        <ul class="mt-6 space-y-2.5">
          <li v-for="item in highlights" :key="item" class="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
            <Icon name="lucide:check-circle-2" class="size-4 shrink-0 text-primary-600 dark:text-primary-400" />
            {{ item }}
          </li>
        </ul>

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
              <p class="mt-1 text-xs text-green-600 dark:text-green-400">+12% this month</p>
            </div>

            <div class="rounded-xl bg-white/90 p-4 dark:bg-gray-900/80">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">{{ t('home.stats.tasksCompleted') }}</p>
                <Icon name="lucide:check-check" class="text-primary-600" />
              </div>
              <p class="mt-2 text-2xl font-semibold">92%</p>
              <div class="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                <div class="h-1.5 w-[92%] rounded-full bg-primary-500" />
              </div>
            </div>

            <div class="rounded-xl bg-white/90 p-4 dark:bg-gray-900/80">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">{{ t('home.stats.systemStatus') }}</p>
                <Icon name="lucide:activity" class="text-green-600" />
              </div>
              <div class="mt-2 flex items-center gap-2">
                <span class="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p class="text-2xl font-semibold">{{ t('home.stats.healthy') }}</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </section>
  </UContainer>

  <!-- Trust Stats Bar -->
  <div class="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
    <UContainer class="py-8">
      <div class="grid grid-cols-3 gap-6 text-center divide-x divide-gray-200 dark:divide-gray-800">
        <div>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">1,200+</p>
          <p class="mt-1 text-sm text-gray-500">{{ t('home.trustStats.users') }}</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">50k+</p>
          <p class="mt-1 text-sm text-gray-500">{{ t('home.trustStats.tasks') }}</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">99.9%</p>
          <p class="mt-1 text-sm text-gray-500">{{ t('home.trustStats.uptime') }}</p>
        </div>
      </div>
    </UContainer>
  </div>

  <!-- How It Works Section -->
  <UContainer class="py-20 md:py-24">
    <div class="mb-12 text-center">
      <UBadge color="primary" variant="subtle" class="mb-4">{{ t('home.howItWorks.label') }}</UBadge>
      <h2 class="text-3xl font-bold tracking-tight md:text-4xl text-gray-900 dark:text-white">
        {{ t('home.howItWorks.heading') }}
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-gray-600 dark:text-gray-300">
        {{ t('home.howItWorks.subheading') }}
      </p>
    </div>

    <div class="relative grid gap-10 md:grid-cols-3">
      <!-- connector line -->
      <div class="absolute top-7 left-1/6 right-1/6 hidden h-px bg-gray-200 dark:bg-gray-800 md:block" />

      <div class="flex flex-col items-center text-center">
        <div class="relative mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 ring-4 ring-white text-lg font-bold text-primary-700 dark:bg-primary-900/40 dark:ring-gray-950 dark:text-primary-300">
          01
        </div>
        <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{{ t('home.howItWorks.step1.title') }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('home.howItWorks.step1.desc') }}</p>
      </div>

      <div class="flex flex-col items-center text-center">
        <div class="relative mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 ring-4 ring-white text-lg font-bold text-primary-700 dark:bg-primary-900/40 dark:ring-gray-950 dark:text-primary-300">
          02
        </div>
        <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{{ t('home.howItWorks.step2.title') }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('home.howItWorks.step2.desc') }}</p>
      </div>

      <div class="flex flex-col items-center text-center">
        <div class="relative mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 ring-4 ring-white text-lg font-bold text-primary-700 dark:bg-primary-900/40 dark:ring-gray-950 dark:text-primary-300">
          03
        </div>
        <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{{ t('home.howItWorks.step3.title') }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('home.howItWorks.step3.desc') }}</p>
      </div>
    </div>
  </UContainer>

  <!-- Features Section -->
  <div class="bg-gray-50 dark:bg-gray-900/30">
    <UContainer class="py-20 md:py-24">
      <div class="mb-12 text-center">
        <UBadge color="primary" variant="subtle" class="mb-4">{{ t('home.features.label') }}</UBadge>
        <h2 class="text-3xl font-bold tracking-tight md:text-4xl text-gray-900 dark:text-white">
          {{ t('home.features.heading') }}
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
          {{ t('home.features.subheading') }}
        </p>
      </div>

      <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <UCard class="group border border-gray-200/50 bg-white/60 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800/50 dark:bg-gray-900/40">
          <div class="flex gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 transition-transform duration-200 group-hover:scale-110 dark:bg-primary-900/40">
              <Icon name="lucide:zap" class="size-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold text-gray-900 dark:text-white">{{ t('home.features.speed.title') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('home.features.speed.desc') }}</p>
            </div>
          </div>
        </UCard>

        <UCard class="group border border-gray-200/50 bg-white/60 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800/50 dark:bg-gray-900/40">
          <div class="flex gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 transition-transform duration-200 group-hover:scale-110 dark:bg-cyan-900/40">
              <Icon name="lucide:shield-check" class="size-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold text-gray-900 dark:text-white">{{ t('home.features.secure.title') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('home.features.secure.desc') }}</p>
            </div>
          </div>
        </UCard>

        <UCard class="group border border-gray-200/50 bg-white/60 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800/50 dark:bg-gray-900/40">
          <div class="flex gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 transition-transform duration-200 group-hover:scale-110 dark:bg-purple-900/40">
              <Icon name="lucide:layout-template" class="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold text-gray-900 dark:text-white">{{ t('home.features.design.title') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('home.features.design.desc') }}</p>
            </div>
          </div>
        </UCard>

        <UCard class="group border border-gray-200/50 bg-white/60 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800/50 dark:bg-gray-900/40">
          <div class="flex gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 transition-transform duration-200 group-hover:scale-110 dark:bg-green-900/40">
              <Icon name="lucide:users" class="size-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold text-gray-900 dark:text-white">{{ t('home.features.team.title') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('home.features.team.desc') }}</p>
            </div>
          </div>
        </UCard>

        <UCard class="group border border-gray-200/50 bg-white/60 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800/50 dark:bg-gray-900/40">
          <div class="flex gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 transition-transform duration-200 group-hover:scale-110 dark:bg-orange-900/40">
              <Icon name="lucide:bell" class="size-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold text-gray-900 dark:text-white">{{ t('home.features.notifications.title') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('home.features.notifications.desc') }}</p>
            </div>
          </div>
        </UCard>

        <UCard class="group border border-gray-200/50 bg-white/60 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800/50 dark:bg-gray-900/40">
          <div class="flex gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-100 transition-transform duration-200 group-hover:scale-110 dark:bg-pink-900/40">
              <Icon name="lucide:bar-chart-2" class="size-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h3 class="mb-1 font-semibold text-gray-900 dark:text-white">{{ t('home.features.analytics.title') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('home.features.analytics.desc') }}</p>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>

  <!-- CTA Section -->
  <UContainer class="py-20 md:py-24">
    <div class="rounded-3xl bg-gradient-to-br from-primary-500/15 via-blue-500/10 to-cyan-500/15 p-10 md:p-16 text-center ring-1 ring-primary-200/50 dark:ring-primary-800/30">
      <h2 class="text-3xl font-bold tracking-tight md:text-4xl text-gray-900 dark:text-white">
        {{ t('home.cta.heading') }}
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-gray-600 dark:text-gray-300">
        {{ t('home.cta.subheading') }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <UButton to="/register" size="xl">{{ t('home.cta.button') }}</UButton>
        <UButton to="/login" size="xl" variant="outline">{{ t('home.actions.login') }}</UButton>
      </div>
    </div>
  </UContainer>
</template>
