<script setup lang="ts">
import { useKanban } from '~/composables/useKanban'
import { useProjects } from '~/composables/useProjects'
import type { Task } from '~/composables/useKanban'

import dayjs from 'dayjs'
import MarkdownEditor from '~/components/common/MarkdownEditor.vue'

const props = defineProps<{ modelValue: boolean; task: Task | null }>()
const emit = defineEmits(['update:modelValue', 'updated'])

const toast = useToast()
const { t } = useI18n()
const { currentProject } = useProjects()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0 || !props.task) return

  isUploading.value = true
  const file = input.files[0]
  const formData = new FormData()
  formData.append('file', file)

  try {
    await $fetch(`/api/tasks/${props.task._id}/attachments`, {
      method: 'POST',
      body: formData
    })
    toast.add({ title: t('common.success'), description: t('tasks.uploadSuccess'), color: 'success' })
    emit('updated')
    // Reset input
    input.value = ''
  } catch (error) {
    toast.add({ title: t('common.error'), description: t('tasks.uploadError'), color: 'error' })
  } finally {
    isUploading.value = false
  }
}

const editableTask = ref<Partial<Task>>({})

watch(() => props.task, (newTask) => {
  if (newTask) {
    editableTask.value = { ...newTask }
  }
}, { immediate: true })

const memberOptions = computed(() => {
  if (!currentProject.value) return []
  return currentProject.value.members.map(m => ({
    label: m.fullName,
    value: m._id
  }))
})

const handleUpdate = async () => {
  if (!props.task) return

  try {
    await $fetch(`/api/tasks/${props.task._id}`,
      {
        method: 'PATCH',
        body: editableTask.value
      }
    )
    toast.add({ title: t('common.success'), description: t('tasks.updateSuccess'), color: 'success' })
    emit('updated')
    isOpen.value = false
  } catch (error) {
    toast.add({ title: t('common.error'), description: t('tasks.updateError'), color: 'error' })
  }
}

const deleteAttachment = async (publicId: string) => {
  if (!props.task) return

  try {
    await $fetch(`/api/tasks/${props.task._id}/attachments`, {
      method: 'DELETE',
      body: { publicId }
    })
    toast.add({ title: t('common.success'), description: t('tasks.deleteSuccess'), color: 'success' })
    emit('updated')
  } catch (error) {
    toast.add({ title: t('common.error'), description: t('tasks.deleteError'), color: 'error' })
  }
}
</script>

<template>
  <USlideover v-model="isOpen">
    <UCard v-if="editableTask && task" class="flex flex-col flex-1" :ui="{ body: { padding: 'p-4' } }">
      <template #header>
        <div class="flex items-center justify-between">
          <UInput v-model="editableTask.title" class="text-xl font-semibold" variant="none" />
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="isOpen = false" />
        </div>
      </template>

      <div class="space-y-6 overflow-y-auto">
        <UFormField label="Description">
          <MarkdownEditor v-model="editableTask.description" placeholder="Add a more detailed description..." />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Status">
            <USelect v-model="editableTask.status" :options="['planned', 'inProgress', 'inReview', 'done']" />
          </UFormField>
          <UFormField label="Priority">
            <USelect v-model="editableTask.priority" :options="['low', 'medium', 'high', 'urgent']" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Assignee">
            <USelect v-model="editableTask.assignee" :options="memberOptions" placeholder="Select assignee..." />
          </UFormField>
          <UFormField label="Due Date">
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton icon="i-heroicons-calendar-days-20-solid" :label="editableTask.dueDate ? dayjs(editableTask.dueDate).format('MMM D, YYYY') : 'Set date'" />
              <template #panel="{ close }">
                <VDatePicker v-model="editableTask.dueDate" @close="close" />
              </template>
            </UPopover>
          </UFormField>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">Attachments</h3>
            <UButton 
              size="xs" 
              color="gray" 
              icon="i-heroicons-paper-clip" 
              :loading="isUploading"
              @click="triggerFileUpload"
            >
              Upload
            </UButton>
            <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload" accept="image/*" />
          </div>

          <div v-if="task.attachments && task.attachments.length > 0" class="grid grid-cols-2 gap-2">
            <div v-for="file in task.attachments" :key="file.publicId" class="group relative rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <img :src="file.url" :alt="file.filename" class="aspect-video w-full object-cover" />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <UButton 
                  size="xs" 
                  color="error" 
                  icon="i-heroicons-trash" 
                  @click="deleteAttachment(file.publicId)"
                />
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 text-sm text-gray-500">
            No attachments yet.
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton @click="handleUpdate">Save Changes</UButton>
        </div>
      </template>
    </UCard>
  </USlideover>
</template>
