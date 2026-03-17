<script setup lang="ts">
import { useProjects } from '~/composables/useProjects'

const props = defineProps<{ projectId: string }>()

const { currentProject, addMember, removeMember, fetchProjectById } = useProjects()
const { user: currentUser } = useAuth()

const emailToAdd = ref('')
const isAdding = ref(false)

const handleAddMember = async () => {
  if (!emailToAdd.value.trim()) return
  
  isAdding.value = true
  try {
    await addMember(props.projectId, emailToAdd.value)
    emailToAdd.value = ''
  } finally {
    isAdding.value = false
  }
}

const handleRemoveMember = async (memberId: string) => {
  if (confirm('Are you sure you want to remove this member?')) {
    await removeMember(props.projectId, memberId)
  }
}

const isOwner = computed(() => currentProject.value?.owner._id === currentUser.value?.id)

onMounted(() => {
  fetchProjectById(props.projectId)
})
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h3 class="font-semibold text-lg">Manage Team Members</h3>
        <p class="text-sm text-gray-500">Add or remove members by their email address.</p>
      </template>

      <div v-if="isOwner" class="flex gap-2 mb-6">
        <UInput 
          v-model="emailToAdd" 
          placeholder="Enter user email..." 
          class="flex-1"
          @keyup.enter="handleAddMember"
        />
        <UButton 
          :loading="isAdding" 
          @click="handleAddMember"
          icon="i-heroicons-user-plus"
        >
          Add Member
        </UButton>
      </div>

      <div class="divide-y divide-gray-200 dark:divide-gray-800">
        <div v-for="member in currentProject?.members" :key="member._id" class="py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UAvatar :alt="member.fullName" size="sm" />
            <div>
              <p class="font-medium text-sm">{{ member.fullName }}</p>
              <p class="text-xs text-gray-500">{{ member.email }}</p>
            </div>
            <UBadge v-if="member._id === currentProject?.owner._id" variant="soft" size="xs" color="primary">Owner</UBadge>
          </div>
          
          <UButton 
            v-if="isOwner && member._id !== currentProject?.owner._id"
            color="error" 
            variant="ghost" 
            size="xs" 
            icon="i-heroicons-trash"
            @click="handleRemoveMember(member._id)"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>
