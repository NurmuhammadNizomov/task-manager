<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { user, fetchUser, updateUser } = useAuth()
const toast = useToast()
const { t } = useI18n()

const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const personalInfoSchema = z.object({
  fullName: z.string().min(2, t('auth.validation.fullNameMin')),
  bio: z.string().max(500).optional()
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, t('server.validation.required', { field: t('server.fields.password') })),
  newPassword: z.string().min(8, t('auth.validation.passwordMin'))
})

const personalInfoState = ref({
  fullName: user.value?.fullName || '',
  bio: user.value?.bio || ''
})

const passwordState = ref({
  currentPassword: '',
  newPassword: ''
})

watch(user, (newUser) => {
  if (newUser) {
    personalInfoState.value.fullName = newUser.fullName
    personalInfoState.value.bio = newUser.bio || ''
  }
})

const onAvatarClick = () => fileInput.value?.click()

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const formData = new FormData()
  formData.append('file', input.files[0])

  isUploading.value = true
  try {
    await $fetch('/api/user/avatar', { method: 'POST', body: formData })
    await fetchUser()
    toast.add({ title: t('common.success'), description: t('profile.avatarSuccess'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error'), description: t('profile.avatarError'), color: 'error' })
  } finally {
    isUploading.value = false
  }
}

const handlePersonalInfoSubmit = async (event: FormSubmitEvent<z.infer<typeof personalInfoSchema>>) => {
  try {
    await updateUser({ fullName: event.data.fullName, bio: event.data.bio || '' })
    toast.add({ title: t('common.success'), description: t('profile.updateSuccess'), color: 'success' })
  } catch (error) {
    const msg = (error as { data?: { message?: string } })?.data?.message
    toast.add({ title: t('common.error'), description: msg || t('profile.updateError'), color: 'error' })
  }
}

const handlePasswordSubmit = async (event: FormSubmitEvent<z.infer<typeof passwordSchema>>) => {
  try {
    await updateUser({ currentPassword: event.data.currentPassword, newPassword: event.data.newPassword })
    toast.add({ title: t('common.success'), description: t('profile.passwordSuccess'), color: 'success' })
    passwordState.value = { currentPassword: '', newPassword: '' }
  } catch (error) {
    const msg = (error as { data?: { message?: string } })?.data?.message
    toast.add({ title: t('common.error'), description: msg || t('profile.passwordError'), color: 'error' })
  }
}
</script>

<template>
  <div class="space-y-8">
    <section>
      <h1 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{{ t('profile.title') }}</h1>
      <p class="mt-1 text-sm text-gray-500">{{ t('profile.subtitle') }}</p>
    </section>

    <div class="space-y-6">
      <!-- Personal Info -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="lucide:user" class="size-4 text-gray-500" />
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ t('profile.personalInfo') }}</h3>
          </div>
        </template>

        <UForm :schema="personalInfoSchema" :state="personalInfoState" class="space-y-4" @submit="handlePersonalInfoSubmit">
          <!-- Avatar row -->
          <div class="flex items-center gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div class="relative group cursor-pointer shrink-0" @click="onAvatarClick">
              <UAvatar
                :src="user?.avatar?.url"
                :alt="user?.fullName"
                size="2xl"
                class="ring-4 ring-white dark:ring-gray-900"
              />
              <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Icon v-if="!isUploading" name="lucide:camera" class="size-5 text-white" />
                <Icon v-else name="lucide:loader" class="size-5 text-white animate-spin" />
              </div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ user?.fullName }}</p>
              <p class="text-sm text-gray-500">{{ user?.email }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ t('profile.clickToChange') }}</p>
            </div>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField :label="t('profile.form.fullName')" name="fullName" class="w-full">
              <UInput v-model="personalInfoState.fullName" class="w-full" />
            </UFormField>
            <UFormField :label="t('profile.form.email')" class="w-full">
              <UInput :model-value="user?.email" disabled class="w-full" />
            </UFormField>
          </div>
          <UFormField :label="t('profile.form.bio')" name="bio" class="w-full">
            <UTextarea
              v-model="personalInfoState.bio"
              :placeholder="t('profile.form.bioPlaceholder')"
              :rows="3"
              class="w-full"
            />
            <template #hint>
              <span :class="(personalInfoState.bio?.length || 0) > 450 ? 'text-orange-500' : 'text-gray-400'">
                {{ personalInfoState.bio?.length || 0 }}/500
              </span>
            </template>
          </UFormField>
          <UButton type="submit">{{ t('profile.saveChanges') }}</UButton>
        </UForm>
      </UCard>

      <!-- Password -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="lucide:lock" class="size-4 text-gray-500" />
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ t('profile.security') }}</h3>
          </div>
        </template>

        <UForm :schema="passwordSchema" :state="passwordState" class="space-y-4 max-w-md" @submit="handlePasswordSubmit">
          <UFormField :label="t('profile.form.currentPassword')" name="currentPassword" class="w-full">
            <UInput v-model="passwordState.currentPassword" type="password" class="w-full" />
          </UFormField>
          <UFormField :label="t('profile.form.newPassword')" name="newPassword" class="w-full">
            <UInput v-model="passwordState.newPassword" type="password" class="w-full" />
          </UFormField>
          <UButton type="submit" color="neutral" variant="outline">{{ t('profile.changePassword') }}</UButton>
        </UForm>
      </UCard>
    </div>
  </div>
</template>
