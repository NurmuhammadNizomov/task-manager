<script setup lang="ts">
import dayjs from 'dayjs'
import { useProjects, type ProjectStatus } from '~/composables/useProjects'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { t } = useI18n()

useSeoMeta({
  title: () => t('projects.title'),
  description: () => t('projects.subtitle'),
  ogTitle: () => t('projects.title'),
})

const { user } = useAuth()
const { projects, isLoading: projectsLoading, projectsTotal, fetchProjects, reorderProjects, createProject, updateProject, deleteProject } = useProjects()

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

// Search & filter
const searchQuery = ref('')
const filterRole = ref<'all' | 'owned' | 'member'>('all')
const filterStatus = ref<ProjectStatus>('active')
const limit = 20
const offset = ref(0)

const doFetch = (resetOffset = true) => {
  if (resetOffset) offset.value = 0
  fetchProjects({ search: searchQuery.value, limit, offset: offset.value, status: filterStatus.value })
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
const triggerSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => doFetch(), 300)
}
watch(searchQuery, triggerSearch)
watch(filterStatus, () => doFetch())

// true bo'lsa filter/qidiruv aktiv — bo'sh holat "hech loyiha yo'q" emas
const isFiltered = computed(() =>
  filterStatus.value !== 'active' || searchQuery.value.trim() !== '' || filterRole.value !== 'all'
)

const filteredProjects = computed(() => {
  if (filterRole.value === 'owned') return projects.value.filter(p => p.owner.email === user.value?.email)
  if (filterRole.value === 'member') return projects.value.filter(p => p.owner.email !== user.value?.email)
  return projects.value
})

const hasMore = computed(() => offset.value + limit < projectsTotal.value)

const loadMore = () => {
  offset.value += limit
  doFetch(false)
}

const changeProjectStatus = async (projectId: string, status: ProjectStatus) => {
  await updateProject(projectId, { status })
  projects.value = projects.value.filter(p => p._id !== projectId)
}

// Drag-drop reorder (saves to DB)
const draggedId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)

const onDragStart = (id: string) => { draggedId.value = id }
const onDragOver = (id: string) => { if (id !== draggedId.value) dragOverId.value = id }
const onDrop = (targetId: string) => {
  if (!draggedId.value || draggedId.value === targetId) return
  const list = [...projects.value]
  const from = list.findIndex(p => p._id === draggedId.value)
  const to = list.findIndex(p => p._id === targetId)
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
  projects.value = list
  reorderProjects(list.map(p => p._id))
  draggedId.value = null
  dragOverId.value = null
}
const onDragEnd = () => { draggedId.value = null; dragOverId.value = null }

onMounted(() => {
  fetchProjects({ limit, status: 'active' })
  fetchStats()
})

const handleCreateProject = async () => {
  if (!newProjectName.value.trim()) return
  await createProject(newProjectName.value, newProjectDescription.value.trim() || undefined)
  isCreateModalOpen.value = false
  newProjectName.value = ''
  newProjectDescription.value = ''
}

// Edit
const isEditModalOpen = ref(false)
const editingProject = ref<{ _id: string; name: string; description: string } | null>(null)

const openEditModal = (project: { _id: string; name: string; description?: string }) => {
  editingProject.value = { _id: project._id, name: project.name, description: project.description || '' }
  isEditModalOpen.value = true
}

const handleUpdateProject = async () => {
  if (!editingProject.value?.name.trim()) return
  await updateProject(editingProject.value._id, {
    name: editingProject.value.name,
    description: editingProject.value.description || undefined
  })
  isEditModalOpen.value = false
  editingProject.value = null
}

// Delete
const isDeleteModalOpen = ref(false)
const deletingProjectId = ref<string | null>(null)

const openDeleteModal = (projectId: string) => {
  deletingProjectId.value = projectId
  isDeleteModalOpen.value = true
}

const handleDeleteProject = async () => {
  if (!deletingProjectId.value) return
  await deleteProject(deletingProjectId.value)
  isDeleteModalOpen.value = false
  deletingProjectId.value = null
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
            <p class="mt-1 text-xs text-gray-500">{{ stats.highPriorityTasks }} {{ t('dashboard.stats.highPriority') }}</p>
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
            <p class="mt-1 text-xs text-gray-500">{{ t('dashboard.stats.lastSevenDays') }}</p>
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
            <p class="mt-1 text-xs text-gray-500">{{ t('dashboard.stats.acrossProjects') }}</p>
          </div>
          <div class="rounded-xl bg-primary-100 p-2.5 dark:bg-primary-900/40">
            <Icon name="lucide:users" class="text-primary-700 dark:text-primary-300" />
          </div>
        </div>
      </UCard>
    </section>

    <!-- Har doim filter bar ko'rinadi (loading bo'lsa ham) -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative flex-1 min-w-48">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <UInput v-model="searchQuery" :placeholder="t('projects.searchPlaceholder')" class="pl-9" />
      </div>
      <UButtonGroup>
        <UButton
          v-for="role in (['all', 'owned', 'member'] as const)"
          :key="role"
          size="sm"
          :variant="filterRole === role ? 'solid' : 'ghost'"
          :color="filterRole === role ? 'primary' : 'neutral'"
          @click="filterRole = role"
        >
          {{ t(`projects.filter.${role}`) }}
        </UButton>
      </UButtonGroup>
      <UButtonGroup>
        <UButton
          v-for="s in (['active', 'archived', 'completed'] as const)"
          :key="s"
          size="sm"
          :variant="filterStatus === s ? 'solid' : 'ghost'"
          :color="filterStatus === s ? (s === 'active' ? 'primary' : s === 'completed' ? 'success' : 'neutral') : 'neutral'"
          @click="filterStatus = s"
        >
          {{ t(`projects.status.${s}`) }}
        </UButton>
      </UButtonGroup>
    </div>

    <section v-if="projectsLoading" class="text-center py-12">
      <Icon name="lucide:loader" class="mx-auto size-6 animate-spin text-gray-400" />
    </section>

    <!-- Hech qanday loyiha yo'q (filter yo'q holda) -->
    <section v-else-if="projects.length === 0 && !isFiltered" class="text-center py-12">
      <Icon name="lucide:folder-search" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{{ t('projects.noProjects.title') }}</h3>
      <p class="mt-1 text-sm text-gray-500">{{ t('projects.noProjects.description') }}</p>
      <div class="mt-6">
        <UButton @click="isCreateModalOpen = true">
          <template #leading><Icon name="lucide:plus" /></template>
          {{ t('projects.actions.createFirstProject') }}
        </UButton>
      </div>
    </section>

    <!-- Filter aktiv, natija yo'q -->
    <section v-else-if="projects.length === 0 && isFiltered" class="text-center py-10 text-sm text-gray-400">
      {{ t('projects.noResults') }}
    </section>

    <template v-else>
      <!-- Empty filtered state (role filter client-side) -->
      <div v-if="filteredProjects.length === 0" class="text-center py-10 text-sm text-gray-400">
        {{ t('projects.noResults') }}
      </div>

      <!-- Projects grid -->
      <section v-else class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard
          v-for="project in filteredProjects"
          :key="project._id"
          class="ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-primary-500 dark:hover:ring-primary-400 transition-all cursor-grab active:cursor-grabbing"
          :class="dragOverId === project._id ? 'ring-2 ring-primary-400 scale-[1.02]' : ''"
          draggable="true"
          @dragstart="onDragStart(project._id)"
          @dragover.prevent="onDragOver(project._id)"
          @dragleave="dragOverId = null"
          @drop.prevent="onDrop(project._id)"
          @dragend="onDragEnd"
        >
          <div class="flex items-start justify-between gap-3">
            <NuxtLink :to="`/projects/${project._id}`" class="block min-w-0 flex-1" @click.stop>
              <p class="text-lg font-semibold truncate">{{ project.name }}</p>
              <p v-if="project.description" class="mt-1 text-sm text-gray-500 line-clamp-2">{{ project.description }}</p>
              <p class="mt-1 text-xs text-gray-400">{{ t('projects.owner') }}: {{ project.owner.fullName }} · {{ dayjs(project.createdAt).format('MMM D, YYYY') }}</p>
            </NuxtLink>

            <div class="flex items-center gap-1 shrink-0">
              <div class="flex items-center gap-1 text-xs text-gray-500">
                <Icon name="lucide:users" class="size-3.5" />
                <span>{{ project.members.length }}</span>
              </div>
              <template v-if="project.owner.email === user?.email">
                <UDropdownMenu
                  :items="[
                    { label: t('projects.status.active'), icon: 'lucide:play', onSelect: () => changeProjectStatus(project._id, 'active') },
                    { label: t('projects.status.completed'), icon: 'lucide:check-circle', onSelect: () => changeProjectStatus(project._id, 'completed') },
                    { label: t('projects.status.archived'), icon: 'lucide:archive', onSelect: () => changeProjectStatus(project._id, 'archived') },
                  ]"
                  :content="{ side: 'bottom', align: 'end' }"
                >
                  <UButton size="xs" variant="ghost" color="neutral" @click.prevent>
                    <Icon name="lucide:more-vertical" class="size-3.5" />
                  </UButton>
                </UDropdownMenu>
                <UButton size="xs" variant="ghost" color="neutral" @click.prevent="openEditModal(project)">
                  <Icon name="lucide:pencil" class="size-3.5" />
                </UButton>
                <UButton size="xs" variant="ghost" color="error" @click.prevent="openDeleteModal(project._id)">
                  <Icon name="lucide:trash-2" class="size-3.5" />
                </UButton>
              </template>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Load more -->
      <div v-if="hasMore" class="flex justify-center pt-2">
        <UButton variant="ghost" color="neutral" :loading="projectsLoading" @click="loadMore">
          {{ t('projects.loadMore') }}
        </UButton>
      </div>
      </section>
    </template>

    <!-- Delete Confirm Modal -->
    <UModal v-model:open="isDeleteModalOpen" :title="t('projects.modals.delete.title')" size="sm">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('projects.deleteConfirm') }}</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton color="error" @click="handleDeleteProject">{{ t('common.delete') }}</UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="isEditModalOpen" :title="t('projects.modals.edit.title')" size="lg">
      <template #body>
        <div v-if="editingProject" class="flex flex-col gap-4">
          <UFormField :label="t('projects.modals.create.nameLabel')" required>
            <UInput v-model="editingProject.name" class="w-full" @keyup.enter="handleUpdateProject" />
          </UFormField>
          <UFormField :label="t('projects.modals.create.descriptionLabel')">
            <UTextarea v-model="editingProject.description" :rows="3" class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isEditModalOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton :disabled="!editingProject?.name.trim()" @click="handleUpdateProject">{{ t('common.save') }}</UButton>
        </div>
      </template>
    </UModal>

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
