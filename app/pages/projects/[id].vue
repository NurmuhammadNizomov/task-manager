<script setup lang="ts">
import { useKanban } from '~/composables/useKanban'
import { useProjects } from '~/composables/useProjects'
import type { Task } from '~/composables/useKanban'
import TaskDetails from '~/components/kanban/TaskDetails.vue'
import MemberManagement from '~/components/projects/MemberManagement.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const { t } = useI18n()
const projectId = computed(() => route.params.id as string)

const { currentProject, fetchProjectById } = useProjects()
const { parent, columns, isLoading, fetchTasks, createTask, handleTaskMove } = useKanban(projectId.value)

const completeTask = async (task: Task) => {
  try {
    await $fetch(`/api/tasks/${task._id}`, {
      method: 'PATCH',
      body: { status: 'done' }
    })
    await fetchTasks()
  } catch (error) {
    // Handle error
  }
}

const newTaskTitle = ref('')
const columnForNewTask = ref<'planned' | 'inProgress' | 'inReview' | 'done' | null>(null)

const selectedTask = ref<Task | null>(null)
const isDetailsOpen = ref(false)

const tabs = [
  { key: 'board', label: 'Board' },
  { key: 'settings', label: 'Settings' }
]

const openDetails = (task: Task) => {
  selectedTask.value = task
  isDetailsOpen.value = true
}

const openCreateTask = (status: 'planned' | 'inProgress' | 'inReview' | 'done') => {
  columnForNewTask.value = status
}

const handleCreateTask = async () => {
  if (!newTaskTitle.value.trim() || !columnForNewTask.value) return
  await createTask(newTaskTitle.value, columnForNewTask.value)
  newTaskTitle.value = ''
  columnForNewTask.value = null
}

onMounted(() => {
  fetchProjectById(projectId.value)
  fetchTasks()
})

const columnNames = {
  planned: t('tasks.status.planned'),
  inProgress: t('tasks.status.inProgress'),
  inReview: t('tasks.status.inReview'),
  done: t('tasks.status.done')
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex-shrink-0 mb-4">
      <NuxtLink to="/dashboard" class="text-sm text-gray-500 hover:text-primary-500 flex items-center gap-1">
        <Icon name="lucide:arrow-left" />
        {{ t('projects.backToProjects') }}
      </NuxtLink>
      <h1 class="text-3xl font-semibold tracking-tight mt-2">{{ currentProject?.name || 'Loading...' }}</h1>
    </div>

    <UTabs :items="tabs" class="flex-grow flex flex-col">
      <template #item="{ item }">
        <div v-if="item.key === 'board'" class="flex-grow">
          <div v-if="isLoading" class="flex-grow flex items-center justify-center">
            <p>{{ t('common.loading') }}</p>
          </div>
          <div v-else ref="parent" class="flex-grow grid grid-cols-4 gap-4 overflow-x-auto">
            <div v-for="(tasks, status) in columns" :key="status" :id="status" class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex flex-col">
              <h2 class="font-semibold mb-2 px-1">{{ columnNames[status] }} ({{ tasks.length }})</h2>
              <div class="flex-grow space-y-2 overflow-y-auto">
                <div v-for="task in tasks" :key="task._id" :id="task._id" class="group bg-white dark:bg-gray-900 p-3 rounded-md shadow cursor-grab hover:ring-2 hover:ring-primary-500 transition-all" @click="openDetails(task)">
                  <div class="flex items-start justify-between gap-2">
                    <p class="font-medium text-sm">{{ task.title }}</p>
                    <UButton 
                      v-if="status !== 'done'"
                      size="xs" 
                      variant="ghost" 
                      color="neutral" 
                      icon="i-heroicons-check-circle"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                      @click.stop="completeTask(task)"
                    />
                  </div>
                  
                  <div v-if="task.assignee || (task.attachments && task.attachments.length > 0)" class="mt-3 flex items-center justify-between">
                    <div class="flex items-center gap-1">
                      <Icon v-if="task.attachments && task.attachments.length > 0" name="lucide:paperclip" class="size-3 text-gray-400" />
                      <span v-if="task.attachments && task.attachments.length > 0" class="text-[10px] text-gray-400">{{ task.attachments.length }}</span>
                    </div>
                    <UAvatar v-if="task.assignee" :alt="String(task.assignee)" size="xs" />
                  </div>
                </div>
              </div>
              <div v-if="columnForNewTask === status" class="mt-2">
                <UTextarea v-model="newTaskTitle" :placeholder="t('tasks.newTaskPlaceholder')" @keyup.enter="handleCreateTask" />
                <div class="flex justify-end gap-2 mt-2">
                  <UButton size="xs" color="gray" @click="columnForNewTask = null">{{ t('common.cancel') }}</UButton>
                  <UButton size="xs" @click="handleCreateTask">{{ t('common.add') }}</UButton>
                </div>
              </div>
              <UButton v-else class="mt-2" block color="gray" @click="openCreateTask(status)">
                <Icon name="lucide:plus" />
                {{ t('tasks.addTask') }}
              </UButton>
            </div>
          </div>
        </div>
        <div v-if="item.key === 'settings'" class="p-4">
          <MemberManagement :project-id="projectId" />
        </div>
      </template>
    </UTabs>

    <TaskDetails v-model="isDetailsOpen" :task="selectedTask" @updated="fetchTasks" />
  </div>
</template>
