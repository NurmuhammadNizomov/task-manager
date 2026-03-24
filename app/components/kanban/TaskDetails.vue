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
const isDeleting = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const confirmDelete = ref(false)

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

const priorityOptions = computed(() => [
  { label: t('taskPage.priority.low'), value: 'low' },
  { label: t('taskPage.priority.medium'), value: 'medium' },
  { label: t('taskPage.priority.high'), value: 'high' },
  { label: t('taskPage.priority.urgent'), value: 'urgent' }
])


const save = async () => {
  if (!props.task) return
  isSaving.value = true
  try {
    await $fetch(`/api/tasks/${props.task._id}`, {
      method: 'PATCH',
      body: {
        title: form.value.title,
        ...(form.value.description ? { description: form.value.description } : {}),
        priority: form.value.priority,
        status: form.value.status,
        ...(form.value.dueDate ? { dueDate: form.value.dueDate } : { dueDate: null })
      }
    })
    toast.add({ title: t('common.success'), description: t('tasks.updateSuccess'), color: 'success' })
    emit('updated')
    isOpen.value = false
  } catch {
    toast.add({ title: t('common.error'), description: t('tasks.updateError'), color: 'error' })
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

const handleDelete = async () => {
  if (!props.task) return
  if (!confirmDelete.value) {
    confirmDelete.value = true
    return
  }
  isDeleting.value = true
  try {
    await $fetch(`/api/tasks/${props.task._id}`, { method: 'DELETE' })
    toast.add({ title: t('common.success'), description: t('tasks.deleteTaskSuccess'), color: 'success' })
    emit('updated')
    isOpen.value = false
  } catch {
    toast.add({ title: t('common.error'), description: t('tasks.deleteTaskError'), color: 'error' })
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
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
        <UFormField :label="t('tasks.details.titleLabel')">
          <UInput v-model="form.title" class="w-full" />
        </UFormField>

        <UFormField :label="t('tasks.details.descriptionLabel')">
          <UTextarea v-model="form.description" :rows="3" :placeholder="t('tasks.details.descriptionPlaceholder')" class="w-full" />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-3">
          <UFormField :label="t('tasks.details.statusLabel')">
            <USelect v-model="form.status" :items="statusOptions" value-key="value" label-key="label" />
          </UFormField>

          <UFormField :label="t('tasks.details.priorityLabel')">
            <USelect v-model="form.priority" :items="priorityOptions" value-key="value" label-key="label" />
          </UFormField>

          <UFormField :label="t('tasks.details.dueDateLabel')">
            <UInput v-model="form.dueDate" type="date" />
          </UFormField>
        </div>

        <!-- Attachments -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('tasks.details.attachmentsLabel') }}
              <span class="ml-1 text-gray-400">({{ task.attachments?.length || 0 }})</span>
            </p>
            <UButton size="xs" variant="outline" :loading="isUploading" @click="fileInput?.click()">
              <Icon name="lucide:upload" class="size-3.5 mr-1" />
              {{ t('tasks.details.upload') }}
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
            {{ t('tasks.details.noAttachments') }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between gap-2">
        <div>
          <UButton
            v-if="!confirmDelete"
            variant="ghost"
            color="error"
            size="sm"
            @click="handleDelete"
          >
            <Icon name="lucide:trash-2" class="size-3.5 mr-1" />
            {{ t('tasks.deleteTask') }}
          </UButton>
          <div v-else class="flex items-center gap-2">
            <span class="text-sm text-red-500">{{ t('tasks.confirmDelete') }}</span>
            <UButton size="xs" color="error" :loading="isDeleting" @click="handleDelete">{{ t('common.yes') }}</UButton>
            <UButton size="xs" color="neutral" variant="ghost" @click="confirmDelete = false">{{ t('common.no') }}</UButton>
          </div>
        </div>
        <div class="flex gap-2">
          <UButton variant="ghost" color="neutral" @click="isOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton :loading="isSaving" @click="save">{{ t('tasks.details.saveChanges') }}</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
