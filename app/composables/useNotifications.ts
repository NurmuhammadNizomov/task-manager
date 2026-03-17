import type { ApiSuccessResponse } from '~/types/auth'

export interface Notification {
  _id: string
  recipient: string
  sender?: {
    _id: string
    fullName: string
  }
  type: 'task_assigned' | 'task_updated' | 'project_invitation' | 'comment_added' | 'system'
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

export const useNotifications = () => {
  const notifications = useState<Notification[]>('notifications', () => [])
  const unreadCount = useState<number>('notifications:unreadCount', () => 0)
  const isLoading = useState<boolean>('notifications:loading', () => false)

  const fetchNotifications = async (limit = 20, offset = 0) => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiSuccessResponse<Notification[]>>('/api/notifications', {
        params: { limit, offset }
      })
      if (offset === 0) {
        notifications.value = response.data
      } else {
        notifications.value = [...notifications.value, ...response.data]
      }
    } finally {
      isLoading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await $fetch<ApiSuccessResponse<{ count: number }>>('/api/notifications/unread-count')
      unreadCount.value = response.data.count
    } catch {
      // Ignore
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await $fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      const notification = notifications.value.find(n => n._id === id)
      if (notification && !notification.isRead) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch {
      // Ignore
    }
  }

  const markAllAsRead = async () => {
    try {
      await $fetch('/api/notifications/read-all', { method: 'PATCH' })
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
    } catch {
      // Ignore
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await $fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      const index = notifications.value.findIndex(n => n._id === id)
      if (index !== -1) {
        const wasUnread = !notifications.value[index].isRead
        notifications.value.splice(index, 1)
        if (wasUnread) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
      }
    } catch {
      // Ignore
    }
  }

  const clearAll = async () => {
    try {
      await $fetch('/api/notifications', { method: 'DELETE' })
      notifications.value = []
      unreadCount.value = 0
    } catch {
      // Ignore
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  }
}
