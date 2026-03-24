<script setup lang="ts">
import type { Task, TaskStatus, TaskPriority } from '~/composables/useKanban'

const props = defineProps<{
  modelValue: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: []
}>()

const { t } = useI18n()
const toast = useToast()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const isSaving = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const form = ref({
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  status: 'planned' as TaskStatus,
  dueDate: ''
})

watch(() => props.task, (task) => {
  if (task) {
    form.value = {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ''
    }
  }
}, { immediate: true })

const statusOptions = [
  { label: t('tasks.status.planned'), value: 'planned' },
  { label: t('tasks.status.inProgress'), value: 'inProgress' },
  { label: t('tasks.status.inReview'), value: 'inReview' },
  { label: t('tasks.status.done'), value: 'done' }
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
]


const save = async () => {
  if (!props.task) return
  isSaving.value = true
  try {
    await $fetch(`/api/tasks/${props.task._id}`, {
      method: 'PATCH',
      body: {
        title: form.value.title,
        description: form.value.description || undefined,
        priority: form.value.priority,
        status: form.value.status,
        dueDate: form.value.dueDate || undefined
      }
    })
    toast.add({ title: t('common.success'), description: t('tasks.updateSuccess'), color: 'success' })
    emit('updated')
    isOpen.value = false
  } catch (err) {
    const msg = (err as { data?: { message?: string } })?.data?.message
    toast.add({ title: t('common.error'), description: msg || t('tasks.updateError'), color: 'error' })
  } finally {
    isSaving.value = false
  }
}

const onFileChange = async (event: Event) => {
  if (!props.task) return
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const formData = new FormData()
  for (const file of Array.from(input.files)) {
    formData.append('file', file)
  }

  isUploading.value = true
  try {
    await $fetch(`/api/tasks/${props.task._id}/attachments`, {
      method: 'POST',
      body: formData
    })
    toast.add({ title: t('common.success'), description: t('tasks.uploadSuccess'), color: 'success' })
    emit('updated')
  } catch {
    toast.add({ title: t('common.error'), description: t('tasks.uploadError'), color: 'error' })
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
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
  } catch {
    toast.add({ title: t('common.error'), description: t('tasks.deleteError'), color: 'error' })
  }
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <UModal v-model:open="isOpen" :title="task?.title" :ui="{ content: 'max-w-2xl' }">
    <template v-if="task" #body>
      <div class="space-y-5">
        <UFormField label="Title">
          <UInput v-model="form.title" />
        </UFormField>

        <UFormField label="Description">
          <UTextarea v-model="form.description" :rows="3" placeholder="Add a description..." />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-3">
          <UFormField label="Status">
            <USelect v-model="form.status" :items="statusOptions" value-key="value" label-key="label" />
          </UFormField>

          <UFormField label="Priority">
            <USelect v-model="form.priority" :items="priorityOptions" value-key="value" label-key="label" />
          </UFormField>

          <UFormField label="Due date">
            <UInput v-model="form.dueDate" type="date" />
          </UFormField>
        </div>

        <!-- Attachments -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Attachments
              <span class="ml-1 text-gray-400">({{ task.attachments?.length || 0 }})</span>
            </p>
            <UButton size="xs" variant="outline" :loading="isUploading" @click="fileInput?.click()">
              <Icon name="lucide:upload" class="size-3.5 mr-1" />
              Upload
            </UButton>
            <input ref="fileInput" type="file" multiple class="hidden" @change="onFileChange" />
          </div>

          <div v-if="task.attachments?.length" class="space-y-2">
            <div
              v-for="att in task.attachments"
              :key="att.publicId"
              class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <Icon name="lucide:file" class="size-4 shrink-0 text-gray-400" />
              <div class="min-w-0 flex-1">
                <a :href="att.url" target="_blank" class="block truncate text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
                  {{ att.filename }}
                </a>
                <p class="text-xs text-gray-400">{{ formatBytes(att.size) }}</p>
              </div>
              <UButton size="xs" variant="ghost" color="error" @click="deleteAttachment(att.publicId)">
                <Icon name="lucide:trash-2" class="size-3.5" />
              </UButton>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-lg dark:border-gray-700">
            No attachments yet
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" color="neutral" @click="isOpen = false">{{ t('common.cancel') }}</UButton>
        <UButton :loading="isSaving" @click="save">Save changes</UButton>
      </div>
    </template>
  </UModal>
</template>
