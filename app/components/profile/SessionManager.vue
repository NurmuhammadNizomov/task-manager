<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useSessions } from '~/composables/useSessions'

dayjs.extend(relativeTime)

const { 
  sessions, 
  isLoading, 
  fetchSessions, 
  revokeSession, 
  revokeAllOtherSessions,
  getDeviceIcon,
  getDeviceInfo
} = useSessions()

const currentSessionId = useCookie('auth:refreshToken')

onMounted(() => {
  fetchSessions()
})

const isCurrentSession = (session: any) => {
  // This is a simplified check. A more robust way would be to compare hashed tokens.
  // For UI purposes, we can assume the most recent session is the current one if no better identifier is available.
  // Or, if we had access to the raw refresh token cookie, we could hash it and compare.
  // Let's use a placeholder logic for now.
  return sessions.value.length > 0 && sessions.value[0]._id === session._id
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Active Sessions</h3>
        <UButton 
          color="error" 
          variant="outline" 
          size="xs"
          @click="revokeAllOtherSessions"
        >
          Logout all other devices
        </UButton>
      </div>
      <p class="text-sm text-gray-500 mt-1">This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.</p>
    </template>

    <div v-if="isLoading" class="text-center p-4">
      <p>Loading sessions...</p>
    </div>

    <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
      <div v-for="session in sessions" :key="session._id" class="py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Icon :name="getDeviceIcon(session.userAgent)" class="size-6 text-gray-500" />
          <div>
            <p class="font-medium text-sm">{{ getDeviceInfo(session.userAgent) }}</p>
            <p class="text-xs text-gray-500">
              <span v-if="session.ipAddress">{{ session.ipAddress }} &middot;</span>
              Last used: {{ dayjs(session.lastUsedAt).fromNow() }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <UBadge v-if="isCurrentSession(session)" variant="soft" size="xs">This device</UBadge>
          <UButton 
            v-else
            color="error" 
            variant="ghost" 
            size="xs" 
            icon="i-heroicons-trash"
            @click="revokeSession(session._id)"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
