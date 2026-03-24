<script setup lang="ts">
import { useKanban } from '~/composables/useKanban'
import { useProjects } from '~/composables/useProjects'
import type { Task, TaskStatus, TaskPriority } from '~/composables/useKanban'
import TaskDetails from '~/components/kanban/TaskDetails.vue'
import MemberManagement from '~/components/projects/MemberManagement.vue'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const { t } = useI18n()
const projectId = computed(() => route.params.id as string)

const { currentProject, fetchProjectById } = useProjects()
const {
  columns, isLoading,
  searchQuery, filterPriority, filterStatus,
  dragOverStatus,
  fetchTasks, createTask, updateTask,
  onDragStart, onDragOver, onDragEnd, onDrop
} = useKanban(projectId.value)

const newTaskTitle = ref('')
const columnForNewTask = ref<TaskStatus | null>(null)
const selectedTask = ref<Task | null>(null)
const isDetailsOpen = ref(false)

const tabs = computed(() => [
  { key: 'board', label: t('projects.tabs.board') },
  { key: 'settings', label: t('projects.tabs.settings') }
])

const priorityOptions = [
  { label: t('dashboard.priority.low'), value: 'low' },
  { label: t('dashboard.priority.medium'), value: 'medium' },
  { label: t('dashboard.priority.high'), value: 'high' },
  { label: t('taskPage.priority.urgent'), value: 'urgent' }
]

const columnMeta: Record<TaskStatus, { label: string; color: string; headerClass: string }> = {
  planned: { label: t('tasks.status.planned'), color: 'gray', headerClass: 'text-gray-600 dark:text-gray-400' },
  inProgress: { label: t('tasks.status.inProgress'), color: 'blue', headerClass: 'text-blue-600 dark:text-blue-400' },
  inReview: { label: t('tasks.status.inReview'), color: 'amber', headerClass: 'text-amber-600 dark:text-amber-400' },
  done: { label: t('tasks.status.done'), color: 'green', headerClass: 'text-green-600 dark:text-green-400' }
}

const priorityMeta: Record<TaskPriority, { label: string; class: string }> = {
  low: { label: t('taskPage.priority.low'), class: 'text-gray-500' },
  medium: { label: t('taskPage.priority.medium'), class: 'text-blue-500' },
  high: { label: t('taskPage.priority.high'), class: 'text-orange-500' },
  urgent: { label: t('taskPage.priority.urgent'), class: 'text-red-500' }
}

const openDetails = (task: Task) => {
  selectedTask.value = task
  isDetailsOpen.value = true
}

const openCreateTask = (status: TaskStatus) => {
  columnForNewTask.value = status
  newTaskTitle.value = ''
}

const handleCreateTask = async () => {
  if (!newTaskTitle.value.trim() || !columnForNewTask.value) return
  await createTask(newTaskTitle.value, columnForNewTask.value)
  newTaskTitle.value = ''
  columnForNewTask.value = null
}

const hasActiveFilters = computed(
  () => searchQuery.value || filterPriority.value || filterStatus.value
)

const clearFilters = () => {
  searchQuery.value = ''
  filterPriority.value = null
  filterStatus.value = null
}

onMounted(() => {
  fetchProjectById(projectId.value)
  fetchTasks()
})
</script>

<template>
  <div class="flex flex-col h-full gap-4">
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <NuxtLink to="/dashboard" class="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 transition-colors">
          <Icon name="lucide:arrow-left" class="size-3.5" />
          {{ t('projects.backToProjects') }}
        </NuxtLink>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {{ currentProject?.name || '...' }}
        </h1>
      </div>
    </div>

    <UTabs :items="tabs" class="flex flex-col flex-1">
      <template #item="{ item }">
        <!-- Board Tab -->
        <div v-if="item.key === 'board'" class="flex flex-col flex-1 gap-4 pt-2">

          <!-- Filter Bar -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative flex-1 min-w-48">
              <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <UInput
                v-model="searchQuery"
                :placeholder="t('taskPage.searchPlaceholder')"
                class="pl-9"
              />
            </div>

            <USelect
              v-model="filterPriority"
              :items="priorityOptions"
              value-key="value"
              label-key="label"
              :placeholder="t('taskPage.allPriorities')"
              class="w-44"
            />

            <UButton
              v-if="hasActiveFilters"
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
          <div v-if="isLoading" class="flex items-center justify-center py-16">
            <UIcon name="lucide:loader" class="size-6 animate-spin text-gray-400" />
          </div>

          <!-- Kanban Board -->
          <div v-else class="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4 pb-4">
            <div
              v-for="status in (['planned', 'inProgress', 'inReview', 'done'] as TaskStatus[])"
              :key="status"
              class="flex flex-col rounded-xl bg-gray-100/80 dark:bg-gray-800/60 p-3 min-w-[240px] transition-all duration-150"
              :class="dragOverStatus === status ? 'ring-2 ring-primary-400 bg-primary-50/60 dark:bg-primary-900/20' : ''"
              @dragover.prevent="onDragOver(status)"
              @dragleave="dragOverStatus === status ? (dragOverStatus = null) : null"
              @drop.prevent="onDrop(status)"
            >
              <!-- Column Header -->
              <div class="mb-3 flex items-center justify-between px-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold" :class="columnMeta[status].headerClass">
                    {{ columnMeta[status].label }}
                  </span>
                  <UBadge :color="columnMeta[status].color" variant="subtle" size="sm">
                    {{ columns[status].length }}
                  </UBadge>
                </div>
              </div>

              <!-- Task Cards -->
              <div class="flex flex-col gap-2 flex-1 min-h-[80px]">
                <div
                  v-for="task in columns[status]"
                  :key="task._id"
                  class="group cursor-grab rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200/80 transition-all duration-150 hover:shadow-md hover:ring-primary-300 active:cursor-grabbing dark:bg-gray-900 dark:ring-gray-700"
                  draggable="true"
                  @dragstart="onDragStart(task._id, task.status)"
                  @dragend="onDragEnd"
                  @click="openDetails(task)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-medium text-gray-900 leading-snug dark:text-white">{{ task.title }}</p>
                    <UButton
                      v-if="status !== 'done'"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      @click.stop="updateTask(task._id, { status: 'done' })"
                    >
                      <Icon name="lucide:check" class="size-3.5" />
                    </UButton>
                  </div>

                  <div v-if="task.description" class="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {{ task.description }}
                  </div>

                  <!-- Task Meta -->
                  <div class="mt-2 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <!-- Priority -->
                      <span class="text-[11px] font-medium" :class="priorityMeta[task.priority]?.class">
                        {{ priorityMeta[task.priority]?.label }}
                      </span>
                      <!-- Attachments -->
                      <span v-if="task.attachments?.length" class="flex items-center gap-0.5 text-[11px] text-gray-400">
                        <Icon name="lucide:paperclip" class="size-3" />
                        {{ task.attachments.length }}
                      </span>
                      <!-- Due date -->
                      <span v-if="task.dueDate" class="text-[11px] text-gray-400">
                        {{ new Date(task.dueDate).toLocaleDateString() }}
                      </span>
                    </div>
                    <UAvatar v-if="task.assignee" :alt="String(task.assignee)" size="xs" />
                  </div>
                </div>
              </div>

              <!-- Add Task -->
              <div v-if="columnForNewTask === status" class="mt-2">
                <UTextarea
                  v-model="newTaskTitle"
                  :placeholder="t('tasks.newTaskPlaceholder')"
                  :rows="2"
                  autofocus
                  @keydown.enter.prevent="handleCreateTask"
                  @keydown.escape="columnForNewTask = null"
                />
                <div class="flex justify-end gap-2 mt-2">
                  <UButton size="xs" color="neutral" variant="ghost" @click="columnForNewTask = null">
                    {{ t('common.cancel') }}
                  </UButton>
                  <UButton size="xs" @click="handleCreateTask">
                    {{ t('tasks.addTask') }}
                  </UButton>
                </div>
              </div>
              <UButton
                v-else
                class="mt-2 w-full"
                variant="ghost"
                color="neutral"
                size="sm"
                @click="openCreateTask(status)"
              >
                <Icon name="lucide:plus" class="size-4" />
                {{ t('tasks.addTask') }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="item.key === 'settings'" class="pt-4">
          <MemberManagement :project-id="projectId" />
        </div>
      </template>
    </UTabs>

    <!-- Task Details Modal -->
    <TaskDetails
      v-model="isDetailsOpen"
      :task="selectedTask"
      @updated="fetchTasks"
    />
  </div>
</template>
