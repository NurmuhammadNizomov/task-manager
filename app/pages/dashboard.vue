<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { t } = useI18n()

type TaskStatus = 'inProgress' | 'planned' | 'done'
type TaskPriority = 'high' | 'medium' | 'low'

const stats = computed(() => [
  {
    title: t('dashboard.stats.openTasks'),
    value: '24',
    icon: 'lucide:list-todo',
    hint: t('dashboard.stats.openTasksHint')
  },
  {
    title: t('dashboard.stats.completedWeek'),
    value: '61',
    icon: 'lucide:check-circle-2',
    hint: t('dashboard.stats.completedWeekHint')
  },
  {
    title: t('dashboard.stats.teamMembers'),
    value: '8',
    icon: 'lucide:users',
    hint: t('dashboard.stats.teamMembersHint')
  }
])

const todayTasks = computed(
  () =>
    [
      { title: t('dashboard.tasks.roadmap'), status: 'inProgress', priority: 'high' },
      { title: t('dashboard.tasks.otpResend'), status: 'planned', priority: 'medium' },
      { title: t('dashboard.tasks.deployStaging'), status: 'done', priority: 'low' }
    ] as Array<{ title: string; status: TaskStatus; priority: TaskPriority }>
)

const resolveStatusColor = (status: TaskStatus) => {
  if (status === 'done') {
    return 'success'
  }

  if (status === 'inProgress') {
    return 'primary'
  }

  return 'neutral'
}
</script>

<template>
  <div class="space-y-8">
    <section class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-sm text-gray-500">{{ t('dashboard.overview') }}</p>
        <h1 class="text-3xl font-semibold tracking-tight">{{ t('dashboard.title') }}</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">{{ t('dashboard.subtitle') }}</p>
      </div>

      <div class="flex gap-2">
        <UButton variant="outline" color="neutral">
          <template #leading>
            <Icon name="lucide:filter" />
          </template>
          {{ t('dashboard.actions.filter') }}
        </UButton>
        <UButton>
          <template #leading>
            <Icon name="lucide:plus" />
          </template>
          {{ t('dashboard.actions.newTask') }}
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
          <h2 class="font-semibold">{{ t('dashboard.todayTasks') }}</h2>
        </template>

        <div class="space-y-3">
          <div
            v-for="task in todayTasks"
            :key="task.title"
            class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800"
          >
            <div>
              <p class="font-medium">{{ task.title }}</p>
              <p class="text-xs text-gray-500">{{ t('dashboard.priority.label') }}: {{ t(`dashboard.priority.${task.priority}`) }}</p>
            </div>
            <UBadge
              :color="resolveStatusColor(task.status)"
              variant="soft"
            >
              {{ t(`dashboard.status.${task.status}`) }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <template #header>
          <h2 class="font-semibold">{{ t('dashboard.quickLinks.title') }}</h2>
        </template>

        <div class="grid gap-2">
          <UButton to="/" variant="ghost" color="neutral" class="justify-start">{{ t('dashboard.quickLinks.main') }}</UButton>
          <UButton to="/login" variant="ghost" color="neutral" class="justify-start">{{ t('dashboard.quickLinks.login') }}</UButton>
          <UButton to="/register" variant="ghost" color="neutral" class="justify-start">{{ t('dashboard.quickLinks.register') }}</UButton>
        </div>
      </UCard>
    </section>
  </div>
</template>
