import type { ApiSuccessResponse } from '~/types/auth'

export type TaskStatus = 'planned' | 'inProgress' | 'inReview' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  position: number
  project: string
  assignee?: string
  dueDate?: string
  attachments: {
    publicId: string
    url: string
    filename: string
    mimeType: string
    size: number
  }[]
  createdAt: string
  updatedAt: string
}

export const useKanban = (projectId: string) => {
  const toast = useToast()
  const { t } = useI18n()

  const allTasks = ref<Task[]>([])
  const isLoading = ref(false)

  // Filter state
  const searchQuery = ref('')
  const filterPriority = ref<TaskPriority | null>(null)
  const filterStatus = ref<TaskStatus | null>(null)

  // Drag state
  const draggingTaskId = ref<string | null>(null)
  const draggingFromStatus = ref<TaskStatus | null>(null)
  const dragOverStatus = ref<TaskStatus | null>(null)

  const STATUS_ORDER: TaskStatus[] = ['planned', 'inProgress', 'inReview', 'done']

  const filteredTasks = computed(() => {
    return allTasks.value.filter((task) => {
      const matchesSearch =
        !searchQuery.value ||
        task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)

      const matchesPriority = !filterPriority.value || task.priority === filterPriority.value
      const matchesStatus = !filterStatus.value || task.status === filterStatus.value

      return matchesSearch && matchesPriority && matchesStatus
    })
  })

  const columns = computed(() => {
    const cols: Record<TaskStatus, Task[]> = {
      planned: [],
      inProgress: [],
      inReview: [],
      done: []
    }

    for (const task of filteredTasks.value) {
      if (cols[task.status]) {
        cols[task.status].push(task)
      }
    }

    // Sort by position in each column
    for (const status of STATUS_ORDER) {
      cols[status].sort((a, b) => a.position - b.position)
    }

    return cols
  })

  const fetchTasks = async () => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiSuccessResponse<Task[]>>(`/api/projects/${projectId}/tasks`)
      allTasks.value = response.data
    } catch {
      toast.add({ title: t('common.error'), description: t('tasks.fetchError'), color: 'error' })
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (title: string, status: TaskStatus) => {
    try {
      const maxPosition = Math.max(0, ...allTasks.value.filter((t) => t.status === status).map((t) => t.position))
      const response = await $fetch<ApiSuccessResponse<Task>>(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        body: { title, status, position: maxPosition + 1 }
      })
      allTasks.value.push(response.data)
      toast.add({ title: t('common.success'), description: t('tasks.createSuccess'), color: 'success' })
      return response.data
    } catch {
      toast.add({ title: t('common.error'), description: t('tasks.createError'), color: 'error' })
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await $fetch<ApiSuccessResponse<Task>>(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: updates
      })
      const idx = allTasks.value.findIndex((t) => t._id === taskId)
      if (idx !== -1) allTasks.value[idx] = response.data
      toast.add({ title: t('common.success'), description: t('tasks.updateSuccess'), color: 'success' })
      return response.data
    } catch {
      toast.add({ title: t('common.error'), description: t('tasks.updateError'), color: 'error' })
    }
  }

  const handleTaskMove = async (taskId: string, toStatus: TaskStatus) => {
    const task = allTasks.value.find((t) => t._id === taskId)
    if (!task || task.status === toStatus) return

    // Optimistic update
    const originalStatus = task.status
    task.status = toStatus

    try {
      await $fetch(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        body: { status: toStatus }
      })
    } catch {
      // Revert on failure
      task.status = originalStatus
      toast.add({ title: t('common.error'), description: t('tasks.moveError'), color: 'error' })
    }
  }

  // Drag and drop handlers
  const onDragStart = (taskId: string, fromStatus: TaskStatus) => {
    draggingTaskId.value = taskId
    draggingFromStatus.value = fromStatus
  }

  const onDragOver = (status: TaskStatus) => {
    dragOverStatus.value = status
  }

  const onDragEnd = () => {
    draggingTaskId.value = null
    draggingFromStatus.value = null
    dragOverStatus.value = null
  }

  const onDrop = async (toStatus: TaskStatus) => {
    if (!draggingTaskId.value || draggingFromStatus.value === toStatus) {
      onDragEnd()
      return
    }
    await handleTaskMove(draggingTaskId.value, toStatus)
    onDragEnd()
  }

  return {
    allTasks,
    columns,
    isLoading,
    searchQuery,
    filterPriority,
    filterStatus,
    draggingTaskId,
    dragOverStatus,
    fetchTasks,
    createTask,
    updateTask,
    handleTaskMove,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop
  }
}
