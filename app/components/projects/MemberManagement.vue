<script setup lang="ts">
import { useProjects } from '~/composables/useProjects'

const props = defineProps<{ projectId: string }>()

const { t } = useI18n()
const { currentProject, addMember, removeMember } = useProjects()

const inviteEmail = ref('')
const isInviting = ref(false)

const handleInvite = async () => {
  if (!inviteEmail.value.trim()) return
  isInviting.value = true
  try {
    await addMember(props.projectId, inviteEmail.value.trim())
    inviteEmail.value = ''
  } finally {
    isInviting.value = false
  }
}

const handleRemove = async (memberId: string) => {
  await removeMember(props.projectId, memberId)
}
</script>

<template>
  <div class="space-y-6 max-w-xl">
    <div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('projects.settings.title') }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ t('projects.settings.subtitle') }}</p>
    </div>

    <!-- Invite Input -->
    <div class="flex gap-2">
      <UInput
        v-model="inviteEmail"
        type="email"
        :placeholder="t('projects.settings.emailPlaceholder')"
        class="flex-1"
        @keyup.enter="handleInvite"
      />
      <UButton :loading="isInviting" @click="handleInvite">
        <Icon name="lucide:user-plus" class="size-4 mr-1" />
        {{ t('projects.settings.invite') }}
      </UButton>
    </div>

    <!-- Members List -->
    <div v-if="currentProject?.members?.length" class="space-y-2">
      <div
        v-for="memberId in currentProject.members"
        :key="memberId"
        class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
      >
        <div class="flex items-center gap-3">
          <UAvatar :alt="memberId" size="sm" />
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ memberId }}</p>
        </div>
        <UButton size="xs" variant="ghost" color="error" @click="handleRemove(memberId)">
          <Icon name="lucide:user-minus" class="size-3.5" />
        </UButton>
      </div>
    </div>
    <p v-else class="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg dark:border-gray-700">
      {{ t('projects.settings.noMembers') }}
    </p>
  </div>
</template>
