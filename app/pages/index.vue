<template>
  <UContainer class="py-12 md:py-16">
    <section class="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <UBadge color="primary" variant="soft" class="mb-4">Nuxt 4 + @nuxt/ui</UBadge>
        <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
          Task Manager uchun toza auth va dashboard bazasi
        </h1>
        <p class="mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
          Login, register, main va dashboard sahifalari alohida layoutlarda ishlaydi.
          Hozir UI flow tayyor, keyingi qadamda API/auth logikasini to'g'ridan-to'g'ri ulaymiz.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <UButton to="/login" size="lg">Login</UButton>
          <UButton to="/register" size="lg" variant="outline">Register</UButton>
          <UButton to="/dashboard" size="lg" variant="soft" color="neutral">Open dashboard</UButton>
        </div>
      </div>

      <UCard class="overflow-hidden border-0 shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
        <div class="rounded-2xl bg-gradient-to-br from-primary-500/15 via-blue-500/10 to-cyan-500/15 p-6 md:p-8">
          <div class="grid gap-4">
            <div class="rounded-xl bg-white/90 p-4 dark:bg-gray-900/80">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">Active users</p>
                <Icon name="lucide:users" class="text-primary-600" />
              </div>
              <p class="mt-2 text-2xl font-semibold">1,284</p>
            </div>

            <div class="rounded-xl bg-white/90 p-4 dark:bg-gray-900/80">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">Tasks completed</p>
                <Icon name="lucide:check-check" class="text-primary-600" />
              </div>
              <p class="mt-2 text-2xl font-semibold">92%</p>
            </div>

            <div class="rounded-xl bg-white/90 p-4 dark:bg-gray-900/80">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">System status</p>
                <Icon name="lucide:activity" class="text-green-600" />
              </div>
              <p class="mt-2 text-2xl font-semibold">Healthy</p>
            </div>
          </div>
        </div>
      </UCard>
    </section>
  </UContainer>
</template>
