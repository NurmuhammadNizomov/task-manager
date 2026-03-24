<script setup lang="ts">
import dayjs from 'dayjs'
import { useProjects } from '~/composables/useProjects'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { t } = useI18n()
const { projects, isLoading: projectsLoading, fetchProjects, createProject } = useProjects()

const stats = ref({
  openTasks: 0,
  highPriorityTasks: 0,
  completedThisWeek: 0,
  totalMembers: 0
})
const statsLoading = ref(false)

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response = await $fetch<{ data: typeof stats.value }>('/api/dashboard/stats')
    stats.value = response.data
  } finally {
    statsLoading.value = false
  }
}

const isCreateModalOpen = ref(false)
const newProjectName = ref('')
const newProjectDescription = ref('')

// Fetch projects and stats on component mount
onMounted(() => {
  fetchProjects()
  fetchStats()
})

const handleCreateProject = async () => {
  if (!newProjectName.value.trim()) return
  await createProject(newProjectName.value, newProjectDescription.value.trim() || undefined)
  isCreateModalOpen.value = false
  newProjectName.value = ''
  newProjectDescription.value = ''
}
</script>

<template>
  <div class="space-y-8">
    <section class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-sm text-gray-500">{{ t('dashboard.overview') }}</p>
        <h1 class="text-3xl font-semibold tracking-tight">{{ t('projects.title') }}</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">{{ t('projects.subtitle') }}</p>
      </div>

      <div class="flex gap-2">
        <UButton @click="isCreateModalOpen = true">
          <template #leading>
            <Icon name="lucide:plus" />
          </template>
          {{ t('projects.actions.newProject') }}
        </UButton>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-gray-500">{{ t('dashboard.stats.openTasks') }}</p>
            <p class="mt-2 text-3xl font-semibold">{{ stats.openTasks }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ stats.highPriorityTasks }} {{ t('dashboard.stats.openTasksHint') }}</p>
          </div>
          <div class="rounded-xl bg-primary-100 p-2.5 dark:bg-primary-900/40">
            <Icon name="lucide:list-todo" class="text-primary-700 dark:text-primary-300" />
          </div>
        </div>
      </UCard>

      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-gray-500">{{ t('dashboard.stats.completedWeek') }}</p>
            <p class="mt-2 text-3xl font-semibold">{{ stats.completedThisWeek }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ t('dashboard.stats.completedWeekHint') }}</p>
          </div>
          <div class="rounded-xl bg-primary-100 p-2.5 dark:bg-primary-900/40">
            <Icon name="lucide:check-circle-2" class="text-primary-700 dark:text-primary-300" />
          </div>
        </div>
      </UCard>

      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-gray-500">{{ t('dashboard.stats.teamMembers') }}</p>
            <p class="mt-2 text-3xl font-semibold">{{ stats.totalMembers }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ t('dashboard.stats.teamMembersHint') }}</p>
          </div>
          <div class="rounded-xl bg-primary-100 p-2.5 dark:bg-primary-900/40">
            <Icon name="lucide:users" class="text-primary-700 dark:text-primary-300" />
          </div>
        </div>
      </UCard>
    </section>

    <section v-if="projectsLoading" class="text-center">
      <p>{{ t('common.loading') }}</p>
    </section>

    <section v-else-if="projects.length === 0" class="text-center py-12">
      <Icon name="lucide:folder-search" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{{ t('projects.noProjects.title') }}</h3>
      <p class="mt-1 text-sm text-gray-500">{{ t('projects.noProjects.description') }}</p>
      <div class="mt-6">
        <UButton @click="isCreateModalOpen = true">
          <template #leading>
            <Icon name="lucide:plus" />
          </template>
          {{ t('projects.actions.createFirstProject') }}
        </UButton>
      </div>
    </section>

    <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="project in projects" :key="project._id" class="ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-primary-500 dark:hover:ring-primary-400 transition-all">
        <NuxtLink :to="`/projects/${project._id}`" class="block">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="text-lg font-semibold truncate">{{ project.name }}</p>
              <p v-if="project.description" class="mt-1 text-sm text-gray-500 line-clamp-2">{{ project.description }}</p>
              <p class="mt-1 text-xs text-gray-400">{{ t('projects.owner') }}: {{ project.owner.fullName }} · {{ dayjs(project.createdAt).format('MMM D, YYYY') }}</p>
            </div>
            <div class="flex items-center">
              <UPopover mode="hover">
                <UAvatarGroup :max="2">
                  <UAvatar v-for="memberId in project.members" :key="memberId" :alt="memberId" size="sm" />
                </UAvatarGroup>
                <template #panel>
                  <div class="p-2 text-xs">{{ project.members.length }} {{ t('projects.membersLabel') }}</div>
                </template>
              </UPopover>
            </div>
          </div>
        </NuxtLink>
      </UCard>
    </section>

    <UModal v-model:open="isCreateModalOpen" :title="t('projects.modals.create.title')" size="lg">
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField :label="t('projects.modals.create.nameLabel')" required>
            <UInput
              v-model="newProjectName"
              :placeholder="t('projects.modals.create.namePlaceholder')"
              class="w-full"
              autofocus
              @keyup.enter="handleCreateProject"
            />
          </UFormField>
          <UFormField :label="t('projects.modals.create.descriptionLabel')">
            <UTextarea
              v-model="newProjectDescription"
              :placeholder="t('projects.modals.create.descriptionPlaceholder')"
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isCreateModalOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton :disabled="!newProjectName.trim()" @click="handleCreateProject">{{ t('common.create') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
