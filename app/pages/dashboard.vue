<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const stats = [
  { title: 'Open tasks', value: '24', icon: 'lucide:list-todo', hint: '7 high priority' },
  { title: 'Completed this week', value: '61', icon: 'lucide:check-circle-2', hint: '+18% vs last week' },
  { title: 'Team members', value: '8', icon: 'lucide:users', hint: '2 online now' }
]

const todayTasks = [
  { title: 'Product roadmap update', status: 'In progress', priority: 'High' },
  { title: 'Fix auth OTP resend flow', status: 'Planned', priority: 'Medium' },
  { title: 'Deploy staging build', status: 'Done', priority: 'Low' }
]
</script>

<template>
  <div class="space-y-8">
    <section class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-sm text-gray-500">Overview</p>
        <h1 class="text-3xl font-semibold tracking-tight">Welcome to your dashboard</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">Joriy holat, vazifalar va jamoa aktivligi shu yerda.</p>
      </div>

      <div class="flex gap-2">
        <UButton variant="outline" color="neutral">
          <template #leading>
            <Icon name="lucide:filter" />
          </template>
          Filter
        </UButton>
        <UButton>
          <template #leading>
            <Icon name="lucide:plus" />
          </template>
          New task
        </UButton>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="item in stats" :key="item.title" class="ring-1 ring-gray-200 dark:ring-gray-800">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-gray-500">{{ item.title }}</p>
            <p class="mt-2 text-3xl font-semibold">{{ item.value }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ item.hint }}</p>
          </div>
          <div class="rounded-xl bg-primary-100 p-2.5 dark:bg-primary-900/40">
            <Icon :name="item.icon" class="text-primary-700 dark:text-primary-300" />
          </div>
        </div>
      </UCard>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <template #header>
          <h2 class="font-semibold">Today's tasks</h2>
        </template>

        <div class="space-y-3">
          <div
            v-for="task in todayTasks"
            :key="task.title"
            class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800"
          >
            <div>
              <p class="font-medium">{{ task.title }}</p>
              <p class="text-xs text-gray-500">Priority: {{ task.priority }}</p>
            </div>
            <UBadge
              :color="task.status === 'Done' ? 'success' : task.status === 'In progress' ? 'primary' : 'neutral'"
              variant="soft"
            >
              {{ task.status }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <template #header>
          <h2 class="font-semibold">Quick links</h2>
        </template>

        <div class="grid gap-2">
          <UButton to="/" variant="ghost" color="neutral" class="justify-start">Go to main page</UButton>
          <UButton to="/login" variant="ghost" color="neutral" class="justify-start">Go to login</UButton>
          <UButton to="/register" variant="ghost" color="neutral" class="justify-start">Go to register</UButton>
        </div>
      </UCard>
    </section>
  </div>
</template>
