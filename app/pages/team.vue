<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useI18n()
const toast = useToast()
const { user } = useAuth()

interface MemberProject { _id: string; name: string; isOwner: boolean }
interface Member {
  _id: string
  fullName: string
  email: string
  avatar?: { url?: string }
  projects: MemberProject[]
}

const members = ref<Member[]>([])
const ownedProjectIds = ref<string[]>([])
const isLoading = ref(false)

// Add member modal
const isAddOpen = ref(false)
const addEmail = ref('')
const addProjectId = ref('')
const isAdding = ref(false)

// Projects for dropdown (only owned)
const ownedProjects = computed(() =>
  members.value
    .flatMap((m) => m.projects)
    .filter((p) => ownedProjectIds.value.includes(p._id))
    .reduce<MemberProject[]>((acc, p) => {
      if (!acc.some((x) => x._id === p._id)) acc.push(p)
      return acc
    }, [])
)

const fetchTeam = async () => {
  isLoading.value = true
  try {
    const res = await $fetch<{ data: { members: Member[]; ownedProjectIds: string[] } }>('/api/team')
    members.value = res.data.members
    ownedProjectIds.value = res.data.ownedProjectIds
  } catch {
    toast.add({ title: t('common.error'), description: t('teamPage.fetchError'), color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const handleAddMember = async () => {
  if (!addEmail.value.trim() || !addProjectId.value) return
  isAdding.value = true
  try {
    await $fetch(`/api/projects/${addProjectId.value}/members`, {
      method: 'POST',
      body: { email: addEmail.value }
    })
    toast.add({ title: t('common.success'), description: t('projects.members.addSuccess'), color: 'success' })
    isAddOpen.value = false
    addEmail.value = ''
    addProjectId.value = ''
    await fetchTeam()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('projects.members.addError')
    toast.add({ title: t('common.error'), description: msg, color: 'error' })
  } finally {
    isAdding.value = false
  }
}

const handleRemoveMember = async (memberId: string, projectId: string) => {
  try {
    await $fetch(`/api/projects/${projectId}/members`, {
      method: 'DELETE',
      body: { memberId }
    })
    toast.add({ title: t('common.success'), description: t('projects.members.removeSuccess'), color: 'success' })
    await fetchTeam()
  } catch {
    toast.add({ title: t('common.error'), description: t('projects.members.removeError'), color: 'error' })
  }
}

const isCurrentUser = (memberId: string) => user.value?.id === memberId

onMounted(fetchTeam)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {{ t('teamPage.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500">{{ t('teamPage.subtitle') }}</p>
      </div>
      <UButton v-if="ownedProjectIds.length" @click="isAddOpen = true">
        <template #leading><Icon name="lucide:user-plus" /></template>
        {{ t('teamPage.inviteMember') }}
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader" class="size-6 animate-spin text-gray-400" />
    </div>

    <!-- Empty -->
    <div v-else-if="members.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
        <Icon name="lucide:users" class="size-7 text-gray-400" />
      </div>
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('teamPage.noMembers') }}</h3>
      <p class="mt-1 text-sm text-gray-500">{{ t('teamPage.noMembersHint') }}</p>
    </div>

    <!-- Members Grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="member in members"
        :key="member._id"
        class="ring-1 ring-gray-200 dark:ring-gray-800"
      >
        <div class="flex items-start gap-3">
          <UAvatar
            :src="member.avatar?.url"
            :alt="member.fullName"
            size="lg"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ member.fullName }}</p>
              <UBadge v-if="isCurrentUser(member._id)" color="primary" variant="subtle" size="xs">
                {{ t('teamPage.you') }}
              </UBadge>
            </div>
            <p class="text-xs text-gray-500 truncate">{{ member.email }}</p>
          </div>
        </div>

        <!-- Projects this member is in -->
        <div class="mt-4 space-y-2">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t('teamPage.projects') }}</p>
          <div class="flex flex-wrap gap-1.5">
            <div
              v-for="project in member.projects"
              :key="project._id"
              class="group flex items-center gap-1"
            >
              <NuxtLink
                :to="`/projects/${project._id}`"
                class="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                <Icon v-if="project.isOwner" name="lucide:crown" class="size-2.5 text-amber-500" />
                {{ project.name }}
              </NuxtLink>
              <!-- Remove from project (only for project owners, not for self) -->
              <button
                v-if="ownedProjectIds.includes(project._id) && !isCurrentUser(member._id) && !project.isOwner"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                :title="t('teamPage.removeFromProject')"
                @click="handleRemoveMember(member._id, project._id)"
              >
                <Icon name="lucide:x" class="size-3" />
              </button>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Invite Member Modal -->
    <UModal v-model:open="isAddOpen" :title="t('teamPage.inviteTitle')">
      <template #body>
        <div class="space-y-4">
          <UFormField :label="t('teamPage.form.email')">
            <UInput
              v-model="addEmail"
              type="email"
              :placeholder="t('teamPage.form.emailPlaceholder')"
              autofocus
            />
          </UFormField>
          <UFormField :label="t('teamPage.form.project')">
            <USelect
              v-model="addProjectId"
              :items="ownedProjects.map(p => ({ label: p.name, value: p._id }))"
              value-key="value"
              label-key="label"
              :placeholder="t('teamPage.form.selectProject')"
            />
          </UFormField>
          <p class="text-xs text-gray-500">{{ t('teamPage.inviteHint') }}</p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="isAddOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton
            :loading="isAdding"
            :disabled="!addEmail.trim() || !addProjectId"
            @click="handleAddMember"
          >
            <template #leading><Icon name="lucide:user-plus" /></template>
            {{ t('teamPage.invite') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
