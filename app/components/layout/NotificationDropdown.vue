<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { Notification } from '~/composables/useNotifications'
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

const isOpen = ref(false)
const offset = ref(0)
const limit = 10
const hasMore = ref(true)

const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return
  const prev = notifications.value.length
  await fetchNotifications(limit, offset.value)
  if (notifications.value.length === prev) {
    hasMore.value = false
  } else {
    offset.value += limit
  }
}

onMounted(() => {
  fetchNotifications(limit, 0)
  offset.value = limit
  fetchUnreadCount()
  const interval = setInterval(fetchUnreadCount, 60000)
  onUnmounted(() => clearInterval(interval))
})

const handleClick = async (notification: Notification) => {
  if (!notification.isRead) await markAsRead(notification._id)
}
</script>

<template>
  <UPopover v-model:open="isOpen" :content="{ side: 'bottom', align: 'end' }">
    <!-- Trigger -->
    <UButton variant="ghost" color="neutral" class="relative" aria-label="Notifications">
      <Icon name="lucide:bell" class="size-4" />
      <span
        v-if="unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </UButton>

    <!-- Panel -->
    <template #content>
      <div class="w-80 overflow-hidden rounded-xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
            <UBadge v-if="unreadCount > 0" color="error" variant="solid" size="xs">
              {{ unreadCount }}
            </UBadge>
          </div>
          <div class="flex gap-1">
            <UButton
              v-if="unreadCount > 0"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="markAllAsRead"
            >
              Mark all read
            </UButton>
            <UButton
              v-if="notifications.length > 0"
              variant="ghost"
              color="error"
              size="xs"
              @click="clearAll"
            >
              Clear
            </UButton>
          </div>
        </div>

        <!-- List -->
        <div class="max-h-80 overflow-y-auto">
          <div v-if="isLoading && notifications.length === 0" class="flex items-center justify-center py-8">
            <Icon name="lucide:loader" class="size-5 animate-spin text-gray-400" />
          </div>

          <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Icon name="lucide:bell-off" class="size-8 text-gray-300" />
            <p class="text-sm text-gray-400">No notifications yet</p>
          </div>

          <button
            v-for="n in notifications"
            :key="n._id"
            class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            :class="!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''"
            @click="handleClick(n)"
          >
            <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Icon
                :name="n.isRead ? 'lucide:bell' : 'lucide:bell-ring'"
                class="size-4"
                :class="n.isRead ? 'text-gray-400' : 'text-primary-500'"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ n.title }}</p>
              <p class="mt-0.5 text-xs text-gray-500 line-clamp-2">{{ n.message }}</p>
              <p class="mt-1 text-[11px] text-gray-400">{{ dayjs(n.createdAt).fromNow() }}</p>
            </div>
            <div v-if="!n.isRead" class="mt-1.5 size-2 shrink-0 rounded-full bg-primary-500" />
          </button>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0 && hasMore" class="border-t border-gray-200 p-2 dark:border-gray-700">
          <UButton variant="ghost" color="neutral" size="xs" block :loading="isLoading" @click.stop="loadMore">
            Load more
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
