<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useNotifications } from '~/composables/useNotifications'

dayjs.extend(relativeTime)

const { 
  notifications, 
  unreadCount, 
  isLoading,
  fetchNotifications, 
  fetchUnreadCount, 
  markAsRead, 
  markAllAsRead,
  clearAll
} = useNotifications()

const offset = ref(0)
const limit = 10
const hasMore = ref(true)

const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return
  
  const currentLength = notifications.value.length
  await fetchNotifications(limit, offset.value)
  
  if (notifications.value.length === currentLength) {
    hasMore.value = false
  } else {
    offset.value += limit
  }
}

onMounted(() => {
  fetchNotifications(limit, 0)
  offset.value = limit
  fetchUnreadCount()
  
  // Refresh unread count every minute
  const interval = setInterval(fetchUnreadCount, 60000)
  onUnmounted(() => clearInterval(interval))
})

const handleNotificationClick = async (notification: any) => {
  if (!notification.isRead) {
    await markAsRead(notification._id)
  }
}

const items = computed(() => [
  notifications.value.map(n => ({
    label: n.title,
    description: n.message,
    icon: n.isRead ? 'i-heroicons-bell' : 'i-heroicons-bell-alert',
    slot: 'notification',
    ...n
  }))
])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ side: 'bottom', align: 'end', width: 'w-80' }">
    <UButton
      variant="ghost"
      color="neutral"
      class="relative"
      icon="i-heroicons-bell"
    >
      <UBadge
        v-if="unreadCount > 0"
        color="error"
        size="xs"
        class="absolute -top-1 -right-1 px-1 min-w-[1.25rem]"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </UBadge>
    </UButton>

    <template #notification-trailing="{ item }">
      <div class="flex flex-col items-end gap-1">
        <span class="text-[10px] text-gray-500">{{ dayjs(item.createdAt).fromNow() }}</span>
        <div v-if="!item.isRead" class="size-2 rounded-full bg-primary-500"></div>
      </div>
    </template>

    <template #content-header>
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <span class="font-semibold text-sm">Notifications</span>
        <div class="flex gap-2">
          <UButton 
            v-if="unreadCount > 0" 
            variant="ghost" 
            size="xs" 
            @click="markAllAsRead"
          >
            Mark all read
          </UButton>
          <UButton 
            v-if="notifications.length > 0" 
            variant="ghost" 
            size="xs" 
            color="error"
            @click="clearAll"
          >
            Clear
          </UButton>
        </div>
      </div>
    </template>

    <template #content-footer>
      <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500 text-sm">
        No notifications yet.
      </div>
      <div v-else-if="hasMore" class="p-2 border-t border-gray-200 dark:border-gray-800">
        <UButton 
          variant="ghost" 
          size="xs" 
          block 
          :loading="isLoading" 
          @click.stop="loadMore"
        >
          Load more
        </UButton>
      </div>
    </template>
  </UDropdownMenu>
</template>
