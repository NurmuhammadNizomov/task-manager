<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useI18n()
const toast = useToast()

interface TaskProject { _id: string; name: string }
interface TaskAssignee { _id: string; fullName: string; email: string; avatar?: { url?: string } }
interface Task {
  _id: string
  title: string
  description?: string
  status: string
  priority: string
  project: TaskProject
  assignee?: TaskAssignee
  dueDate?: string
  createdAt: string
}
interface ProjectOption { _id: string; name: string }

const tasks = ref<Task[]>([])
const projects = ref<ProjectOption[]>([])
const isLoading = ref(false)

// Filters
const filterStatus = ref<string | null>(null)
const filterPriority = ref<string | null>(null)
const filterProject = ref<string | null>(null)
const filterAssignedToMe = ref(false)
const searchQuery = ref('')

// Create task modal
const isCreateOpen = ref(false)
const newTask = ref({ title: '', status: 'planned', priority: 'medium', projectId: '' })
const isCreating = ref(false)

// Edit task
const editingTask = ref<Task | null>(null)
const isEditOpen = ref(false)

const fetchTasks = async () => {
  isLoading.value = true
  try {
    const params: Record<string, string> = {}
    if (filterStatus.value) params.status = filterStatus.value
    if (filterPriority.value) params.priority = filterPriority.value
    if (filterProject.value) params.projectId = filterProject.value
    if (filterAssignedToMe.value) params.assignedToMe = 'true'

    const res = await $fetch<{ data: { tasks: Task[]; projects: ProjectOption[] } }>('/api/tasks', { params })
    tasks.value = res.data.tasks
    projects.value = res.data.projects
  } catch {
    toast.add({ title: t('common.error'), description: t('tasks.fetchError'), color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const filteredTasks = computed(() => {
  if (!searchQuery.value) return tasks.value
  const q = searchQuery.value.toLowerCase()
  return tasks.value.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      (t.description?.toLowerCase().includes(q) ?? false) ||
      t.project.name.toLowerCase().includes(q)
  )
})

const handleCreateTask = async () => {
  if (!newTask.value.title.trim() || !newTask.value.projectId) return
  isCreating.value = true
  try {
    await $fetch<{ data: Task }>(`/api/projects/${newTask.value.projectId}/tasks`, {
      method: 'POST',
      body: {
        title: newTask.value.title,
        status: newTask.value.status,
        priority: newTask.value.priority,
        position: 1
      }
    })
    toast.add({ title: t('common.success'), description: t('tasks.createSuccess'), color: 'success' })
    isCreateOpen.value = false
    newTask.value = { title: '', status: 'planned', priority: 'medium', projectId: '' }
    await fetchTasks()
  } catch {
    toast.add({ title: t('common.error'), description: t('tasks.createError'), color: 'error' })
  } finally {
    isCreating.value = false
  }
}

const handleStatusChange = async (task: Task, status: string) => {
  try {
    await $fetch(`/api/tasks/${task._id}/move`, { method: 'PATCH', body: { status } })
    task.status = status
    toast.add({ title: t('common.success'), description: t('tasks.updateSuccess'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error'), description: t('tasks.moveError'), color: 'error' })
  }
}

const openEdit = (task: Task) => {
  editingTask.value = { ...task }
  isEditOpen.value = true
}

const handleEditSave = async () => {
  if (!editingTask.value) return
  try {
    await $fetch(`/api/tasks/${editingTask.value._id}`, {
      method: 'PATCH',
      body: {
        title: editingTask.value.title,
        description: editingTask.value.description,
        priority: editingTask.value.priority,
        dueDate: editingTask.value.dueDate || null
      }
    })
    toast.add({ title: t('common.success'), description: t('tasks.updateSuccess'), color: 'success' })
    isEditOpen.value = false
    editingTask.value = null
    await fetchTasks()
  } catch {
    toast.add({ title: t('common.error'), description: t('tasks.updateError'), color: 'error' })
  }
}

const clearFilters = () => {
  filterStatus.value = null
  filterPriority.value = null
  filterProject.value = null
  filterAssignedToMe.value = false
  searchQuery.value = ''
}

const hasFilters = computed(
  () => filterStatus.value || filterPriority.value || filterProject.value || filterAssignedToMe.value || searchQuery.value
)

watch([filterStatus, filterPriority, filterProject, filterAssignedToMe], fetchTasks)

onMounted(fetchTasks)

const statusMeta: Record<string, { label: string; color: 'gray' | 'blue' | 'amber' | 'green'; icon: string }> = {
  planned: { label: t('tasks.status.planned'), color: 'gray', icon: 'lucide:circle-dashed' },
  inProgress: { label: t('tasks.status.inProgress'), color: 'blue', icon: 'lucide:circle-dot' },
  inReview: { label: t('tasks.status.inReview'), color: 'amber', icon: 'lucide:circle-alert' },
  done: { label: t('tasks.status.done'), color: 'green', icon: 'lucide:circle-check' }
}

const priorityMeta: Record<string, { label: string; class: string; icon: string }> = {
  low: { label: t('taskPage.priority.low'), class: 'text-gray-400', icon: 'lucide:arrow-down' },
  medium: { label: t('taskPage.priority.medium'), class: 'text-blue-500', icon: 'lucide:minus' },
  high: { label: t('taskPage.priority.high'), class: 'text-orange-500', icon: 'lucide:arrow-up' },
  urgent: { label: t('taskPage.priority.urgent'), class: 'text-red-500', icon: 'lucide:flame' }
}

const statusOptions = [
  { label: t('tasks.status.planned'), value: 'planned' },
  { label: t('tasks.status.inProgress'), value: 'inProgress' },
  { label: t('tasks.status.inReview'), value: 'inReview' },
  { label: t('tasks.status.done'), value: 'done' }
]

const priorityOptions = [
  { label: t('taskPage.priority.low'), value: 'low' },
  { label: t('taskPage.priority.medium'), value: 'medium' },
  { label: t('taskPage.priority.high'), value: 'high' },
  { label: t('taskPage.priority.urgent'), value: 'urgent' }
]

const taskStatusOptions = [
  { label: t('tasks.status.planned'), value: 'planned' },
  { label: t('tasks.status.inProgress'), value: 'inProgress' },
  { label: t('tasks.status.inReview'), value: 'inReview' },
  { label: t('tasks.status.done'), value: 'done' }
]

const taskPriorityOptions = [
  { label: t('taskPage.priority.low'), value: 'low' },
  { label: t('taskPage.priority.medium'), value: 'medium' },
  { label: t('taskPage.priority.high'), value: 'high' },
  { label: t('taskPage.priority.urgent'), value: 'urgent' }
]

const isOverdue = (task: Task) =>
  task.dueDate && task.status !== 'done' && dayjs(task.dueDate).isBefore(dayjs(), 'day')
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {{ t('taskPage.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500">{{ t('taskPage.subtitle') }}</p>
      </div>
      <UButton @click="isCreateOpen = true">
        <template #leading><Icon name="lucide:plus" /></template>
        {{ t('taskPage.newTask') }}
      </UButton>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative flex-1 min-w-48">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
        <UInput v-model="searchQuery" :placeholder="t('taskPage.searchPlaceholder')" class="pl-9" />
      </div>

      <USelect
        v-model="filterStatus"
        :items="statusOptions"
        value-key="value"
        label-key="label"
        :placeholder="t('taskPage.allStatuses')"
        class="w-40"
      />

      <USelect
        v-model="filterPriority"
        :items="priorityOptions"
        value-key="value"
        label-key="label"
        :placeholder="t('taskPage.allPriorities')"
        class="w-40"
      />

      <USelect
        v-if="projects.length"
        v-model="filterProject"
        :items="projects.map(p => ({ label: p.name, value: p._id }))"
        value-key="value"
        label-key="label"
        :placeholder="t('taskPage.allProjects')"
        class="w-44"
      />

      <UButton
        :variant="filterAssignedToMe ? 'solid' : 'outline'"
        color="neutral"
        size="sm"
        @click="filterAssignedToMe = !filterAssignedToMe"
      >
        <Icon name="lucide:user" class="size-3.5 mr-1" />
        {{ t('taskPage.assignedToMe') }}
      </UButton>

      <UButton
        v-if="hasFilters"
        variant="ghost"
        color="neutral"
        size="sm"
        @click="clearFilters"
      >
        <Icon name="lucide:x" class="size-3.5 mr-1" />
        {{ t('taskPage.clearFilters') }}
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader" class="size-6 animate-spin text-gray-400" />
    </div>

    <!-- Empty -->
    <div v-else-if="filteredTasks.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
        <Icon name="lucide:check-square" class="size-7 text-gray-400" />
      </div>
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('taskPage.noTasks') }}</h3>
      <p class="mt-1 text-sm text-gray-500">{{ hasFilters ? t('taskPage.noTasksFiltered') : t('taskPage.noTasksEmpty') }}</p>
      <UButton v-if="!hasFilters" class="mt-4" @click="isCreateOpen = true">
        <template #leading><Icon name="lucide:plus" /></template>
        {{ t('taskPage.newTask') }}
      </UButton>
    </div>

    <!-- Task List -->
    <div v-else class="space-y-2">
      <div
        v-for="task in filteredTasks"
        :key="task._id"
        class="group flex items-start gap-3 rounded-xl bg-white dark:bg-gray-900 p-4 ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-primary-300 dark:hover:ring-primary-700 transition-all"
      >
        <!-- Status icon -->
        <button
          class="mt-0.5 shrink-0 transition-transform hover:scale-110"
          :title="statusMeta[task.status].label"
          @click.stop
        >
          <UDropdownMenu
            :items="[taskStatusOptions.map(s => ({
              label: s.label,
              onSelect: () => handleStatusChange(task, s.value)
            }))]"
          >
            <Icon
              :name="statusMeta[task.status].icon"
              class="size-5"
              :class="{
                'text-gray-400': task.status === 'planned',
                'text-blue-500': task.status === 'inProgress',
                'text-amber-500': task.status === 'inReview',
                'text-green-500': task.status === 'done'
              }"
            />
          </UDropdownMenu>
        </button>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p
              class="text-sm font-medium text-gray-900 dark:text-white leading-snug"
              :class="{ 'line-through text-gray-400 dark:text-gray-500': task.status === 'done' }"
            >
              {{ task.title }}
            </p>
            <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <UButton size="xs" variant="ghost" color="neutral" @click="openEdit(task)">
                <Icon name="lucide:pencil" class="size-3.5" />
              </UButton>
              <UButton size="xs" variant="ghost" color="neutral" :to="`/projects/${task.project._id}`">
                <Icon name="lucide:external-link" class="size-3.5" />
              </UButton>
            </div>
          </div>

          <p v-if="task.description" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {{ task.description }}
          </p>

          <div class="mt-2 flex flex-wrap items-center gap-3">
            <!-- Project -->
            <NuxtLink
              :to="`/projects/${task.project._id}`"
              class="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-500 transition-colors"
            >
              <Icon name="lucide:folder" class="size-3" />
              {{ task.project.name }}
            </NuxtLink>

            <!-- Priority -->
            <span class="flex items-center gap-0.5 text-xs font-medium" :class="priorityMeta[task.priority].class">
              <Icon :name="priorityMeta[task.priority].icon" class="size-3" />
              {{ priorityMeta[task.priority].label }}
            </span>

            <!-- Due date -->
            <span
              v-if="task.dueDate"
              class="flex items-center gap-1 text-xs"
              :class="isOverdue(task) ? 'text-red-500 font-medium' : 'text-gray-400'"
            >
              <Icon name="lucide:calendar" class="size-3" />
              {{ dayjs(task.dueDate).format('MMM D') }}
              <span v-if="isOverdue(task)" class="text-red-500">({{ t('taskPage.overdue') }})</span>
            </span>

            <!-- Assignee -->
            <span v-if="task.assignee" class="flex items-center gap-1 text-xs text-gray-400">
              <UAvatar :src="task.assignee.avatar?.url" :alt="task.assignee.fullName" size="xs" />
              {{ task.assignee.fullName }}
            </span>
          </div>
        </div>

        <!-- Status badge -->
        <UBadge :color="statusMeta[task.status].color" variant="subtle" size="sm" class="shrink-0 mt-0.5">
          {{ statusMeta[task.status].label }}
        </UBadge>
      </div>
    </div>

    <!-- Total count -->
    <p v-if="!isLoading && filteredTasks.length > 0" class="text-xs text-gray-400 text-right">
      {{ filteredTasks.length }} {{ t('taskPage.tasksCount') }}
    </p>

    <!-- Create Task Modal -->
    <UModal v-model:open="isCreateOpen" :title="t('taskPage.createTitle')">
      <template #body>
        <div class="space-y-4">
          <UFormField :label="t('taskPage.form.title')">
            <UInput
              v-model="newTask.title"
              :placeholder="t('tasks.newTaskPlaceholder')"
              autofocus
            />
          </UFormField>

          <UFormField :label="t('taskPage.form.project')">
            <USelect
              v-model="newTask.projectId"
              :items="projects.map(p => ({ label: p.name, value: p._id }))"
              value-key="value"
              label-key="label"
              :placeholder="t('taskPage.form.selectProject')"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField :label="t('taskPage.form.status')">
              <USelect
                v-model="newTask.status"
                :items="taskStatusOptions"
                value-key="value"
                label-key="label"
              />
            </UFormField>
            <UFormField :label="t('taskPage.form.priority')">
              <USelect
                v-model="newTask.priority"
                :items="taskPriorityOptions"
                value-key="value"
                label-key="label"
              />
            </UFormField>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isCreateOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton
            :loading="isCreating"
            :disabled="!newTask.title.trim() || !newTask.projectId"
            @click="handleCreateTask"
          >
            {{ t('common.create') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit Task Modal -->
    <UModal v-model:open="isEditOpen" :title="t('taskPage.editTitle')" size="lg">
      <template #body>
        <div v-if="editingTask" class="flex flex-col gap-4">
          <UFormField :label="t('taskPage.form.title')" required>
            <UInput v-model="editingTask.title" class="w-full" autofocus />
          </UFormField>
          <UFormField :label="t('taskPage.form.description')">
            <UTextarea v-model="editingTask.description" :rows="3" class="w-full" :placeholder="t('tasks.details.descriptionPlaceholder')" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField :label="t('taskPage.form.priority')">
              <USelect
                v-model="editingTask.priority"
                :items="taskPriorityOptions"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="t('taskPage.form.dueDate')">
              <UInput v-model="editingTask.dueDate" type="date" class="w-full" />
            </UFormField>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isEditOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton :disabled="!editingTask?.title?.trim()" @click="handleEditSave">{{ t('tasks.details.saveChanges') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
