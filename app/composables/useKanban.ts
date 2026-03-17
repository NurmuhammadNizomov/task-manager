import { ref, computed } from 'vue'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import type { ApiSuccessResponse } from '~/types/auth'

export interface Task {
  _id: string
  title: string
  description?: string
  status: 'planned' | 'inProgress' | 'inReview' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
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
}

export const useKanban = (projectId: string) => {
  const { t } = useI18n()
  const toast = useToast()

  const tasks = ref<Task[]>([])
  const isLoading = ref(false)

  const columns = {
    planned: ref<Task[]>([]) as Ref<Task[]>,
    inProgress: ref<Task[]>([]) as Ref<Task[]>,
    inReview: ref<Task[]>([]) as Ref<Task[]>,
    done: ref<Task[]>([]) as Ref<Task[]>
  }

  const [parent, tapes] = useDragAndDrop(columns)

  const fetchTasks = async () => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiSuccessResponse<Task[]>>(`/api/projects/${projectId}/tasks`)
      tasks.value = response.data
      // Distribute tasks into columns
      columns.planned.value = tasks.value.filter(t => t.status === 'planned').sort((a, b) => a.position - b.position)
      columns.inProgress.value = tasks.value.filter(t => t.status === 'inProgress').sort((a, b) => a.position - b.position)
      columns.inReview.value = tasks.value.filter(t => t.status === 'inReview').sort((a, b) => a.position - b.position)
      columns.done.value = tasks.value.filter(t => t.status === 'done').sort((a, b) => a.position - b.position)
    } catch (error) {
      toast.add({ title: t('common.error'), description: t('tasks.fetchError'), color: 'error' })
    } finally {
      isLoading.value = false
    }
  }

  const handleTaskMove = async (event: { targetData: { parent: { id: keyof typeof columns } } }) => {
    const { id: newStatus } = event.targetData.parent
    const movedTask = tapes.value[newStatus].find(t => !tasks.value.some(ot => ot._id === t._id)) as Task | undefined
    if (!movedTask) return

    const oldStatus = movedTask.status
    const oldPosition = movedTask.position
    const newPosition = tapes.value[newStatus].indexOf(movedTask)

    // Optimistic UI update
    movedTask.status = newStatus
    movedTask.position = newPosition

    try {
      await $fetch(`/api/tasks/${movedTask._id}/move`, {
        method: 'PATCH',
        body: { newStatus, newPosition, oldStatus, oldPosition }
      })
      // Refresh all tasks to ensure consistency
      await fetchTasks()
    } catch (error) {
      // Revert optimistic update on error
      movedTask.status = oldStatus
      movedTask.position = oldPosition
      toast.add({ title: t('common.error'), description: t('tasks.moveError'), color: 'error' })
      // Re-sort to visualy revert
      columns[oldStatus].value.sort((a, b) => a.position - b.position)
    }
  }

  const createTask = async (title: string, status: keyof typeof columns) => {
    try {
      const response = await $fetch<ApiSuccessResponse<Task>>(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        body: { title, status }
      })
      columns[status].value.push(response.data)
      tasks.value.push(response.data)
      toast.add({ title: t('common.success'), description: t('tasks.createSuccess'), color: 'success' })
    } catch (error) {
      toast.add({ title: t('common.error'), description: t('tasks.createError'), color: 'error' })
    }
  }

  return {
    parent,
    columns,
    isLoading,
    fetchTasks,
    createTask,
    handleTaskMove
  }
}
