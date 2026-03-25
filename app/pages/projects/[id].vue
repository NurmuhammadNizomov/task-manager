<script setup lang="ts">
import { useKanban } from '~/composables/useKanban'
import { useProjects } from '~/composables/useProjects'
import type { Task, TaskStatus, TaskPriority } from '~/composables/useKanban'
import TaskDetails from '~/components/kanban/TaskDetails.vue'
import dayjs from 'dayjs'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const { t } = useI18n()
const projectId = computed(() => route.params.id as string)

const { currentProject, fetchProjectById } = useProjects()
const {
  allTasks, columns, isLoading,
  searchQuery, filterPriority, filterStatus,
  dragOverStatus, dragOverTaskId, draggingTaskId,
  fetchTasks, createTask, updateTask,
  onDragStart, onDragOver, onDragOverTask, onDragEnd, onDrop
} = useKanban(projectId.value)

const newTaskTitle = ref('')
const columnForNewTask = ref<TaskStatus | null>(null)
const selectedTask = ref<Task | null>(null)
const isDetailsOpen = ref(false)

// Stats
const totalTasks = computed(() => allTasks.value.length)
const doneTasks = computed(() => allTasks.value.filter(t => t.status === 'done').length)
const overdueTasks = computed(() =>
  allTasks.value.filter(t => t.dueDate && t.status !== 'done' && dayjs(t.dueDate).isBefore(dayjs(), 'day')).length
)
const progressPercent = computed(() =>
  totalTasks.value === 0 ? 0 : Math.round((doneTasks.value / totalTasks.value) * 100)
)

const isOverdue = (task: Task) =>
  !!task.dueDate && task.status !== 'done' && dayjs(task.dueDate).isBefore(dayjs(), 'day')

const statusOptions = computed(() => [
  { label: t('tasks.status.planned'), value: 'planned' },
  { label: t('tasks.status.inProgress'), value: 'inProgress' },
  { label: t('tasks.status.inReview'), value: 'inReview' },
  { label: t('tasks.status.done'), value: 'done' }
])

const priorityOptions = computed(() => [
  { label: t('dashboard.priority.low'), value: 'low' },
  { label: t('dashboard.priority.medium'), value: 'medium' },
  { label: t('dashboard.priority.high'), value: 'high' },
  { label: t('taskPage.priority.urgent'), value: 'urgent' }
])

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
      <div class="flex-1 min-w-0">
        <NuxtLink to="/dashboard" class="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 transition-colors">
          <Icon name="lucide:arrow-left" class="size-3.5" />
          {{ t('projects.backToProjects') }}
        </NuxtLink>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {{ currentProject?.name || '...' }}
        </h1>

        <!-- Stats row -->
        <div v-if="!isLoading && totalTasks > 0" class="mt-2 flex flex-wrap items-center gap-4">
          <!-- Progress bar -->
          <div class="flex items-center gap-2">
            <div class="w-24 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                class="h-full rounded-full bg-green-500 transition-all duration-500"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>
            <span class="text-xs text-gray-500">{{ doneTasks }}/{{ totalTasks }}</span>
          </div>
          <!-- Overdue badge -->
          <span v-if="overdueTasks > 0" class="flex items-center gap-1 text-xs font-medium text-red-500">
            <Icon name="lucide:clock" class="size-3.5" />
            {{ overdueTasks }} {{ t('taskPage.overdue') }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-1 gap-4 pt-2">

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
              v-model="filterStatus"
              :items="statusOptions"
              value-key="value"
              label-key="label"
              :placeholder="t('taskPage.allStatuses')"
              class="w-36"
            />

            <USelect
              v-model="filterPriority"
              :items="priorityOptions"
              value-key="value"
              label-key="label"
              :placeholder="t('taskPage.allPriorities')"
              class="w-36"
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
            <Icon name="lucide:loader" class="size-6 animate-spin text-gray-400" />
          </div>

          <!-- Kanban Board -->
          <div v-else class="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4 pb-4">
            <div
              v-for="status in (['planned', 'inProgress', 'inReview', 'done'] as TaskStatus[])"
              :key="status"
              class="flex flex-col rounded-xl bg-gray-100 dark:bg-gray-800/60 p-3 min-w-[240px] transition-all duration-150"
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
                  class="group cursor-grab rounded-lg bg-white dark:bg-gray-800 p-3 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-150 hover:shadow-md active:cursor-grabbing"
                  :class="[
                    isOverdue(task)
                      ? '!ring-red-300 dark:!ring-red-700 hover:!ring-red-400'
                      : 'hover:ring-primary-300 dark:hover:ring-primary-600',
                    dragOverTaskId === task._id && draggingTaskId !== task._id
                      ? 'border-t-2 border-primary-400'
                      : ''
                  ]"
                  draggable="true"
                  @dragstart="onDragStart(task._id, task.status)"
                  @dragend="onDragEnd"
                  @dragover.prevent.stop="onDragOverTask(task._id)"
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
                      <span class="text-[11px] font-medium" :class="priorityMeta[task.priority]?.class">
                        {{ priorityMeta[task.priority]?.label }}
                      </span>
                      <span v-if="task.attachments?.length" class="flex items-center gap-0.5 text-[11px] text-gray-400">
                        <Icon name="lucide:paperclip" class="size-3" />
                        {{ task.attachments.length }}
                      </span>
                      <span
                        v-if="task.dueDate"
                        class="flex items-center gap-0.5 text-[11px]"
                        :class="isOverdue(task) ? 'text-red-500 font-medium' : 'text-gray-400'"
                      >
                        <Icon name="lucide:calendar" class="size-3" />
                        {{ dayjs(task.dueDate).format('MMM D') }}
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
                  class="w-full"
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

    <!-- Task Details Modal -->
    <TaskDetails
      v-model="isDetailsOpen"
      :task="selectedTask"
      @updated="fetchTasks"
    />
  </div>
</template>
