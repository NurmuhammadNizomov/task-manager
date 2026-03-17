<script setup lang="ts">
import dayjs from 'dayjs'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

import SessionManager from '~/components/profile/SessionManager.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { user, fetchUser, updateUser } = useAuth()
const toast = useToast()
const { t } = useI18n()

const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Must be at least 2 characters')
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Must be at least 8 characters')
})

const personalInfoState = ref({
  fullName: user.value?.fullName || ''
})

const passwordState = ref({
  currentPassword: '',
  newPassword: ''
})

watch(user, (newUser) => {
  if (newUser) {
    personalInfoState.value.fullName = newUser.fullName
  }
})

const onAvatarClick = () => {
  fileInput.value?.click()
}

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploading.value = true
  try {
    await $fetch('/api/user/avatar', {
      method: 'POST',
      body: formData
    })
    await fetchUser() // Refresh user data
    toast.add({ title: 'Avatar updated successfully', color: 'green' })
  } catch (error) {
    toast.add({ title: 'Failed to update avatar', color: 'red' })
  } finally {
    isUploading.value = false
  }
}

const handlePersonalInfoSubmit = async (event: FormSubmitEvent<z.infer<typeof personalInfoSchema>>) => {
  try {
    await updateUser({ fullName: event.data.fullName })
    toast.add({ title: 'Profile updated successfully', color: 'green' })
  } catch (error: any) {
    toast.add({ title: error.data?.message || 'Failed to update profile', color: 'red' })
  }
}

const handlePasswordSubmit = async (event: FormSubmitEvent<z.infer<typeof passwordSchema>>) => {
  try {
    await updateUser({
      currentPassword: event.data.currentPassword,
      newPassword: event.data.newPassword
    })
    toast.add({ title: 'Password changed successfully', color: 'green' })
    passwordState.value = { currentPassword: '', newPassword: '' } // Clear fields
  } catch (error: any) {
    toast.add({ title: error.data?.message || 'Failed to change password', color: 'red' })
  }
}
</script>

<template>
  <div class="space-y-8">
    <section>
      <h1 class="text-3xl font-semibold tracking-tight">Profile Settings</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">Manage your account information and preferences.</p>
    </section>

    <div class="grid gap-8 lg:grid-cols-[1fr_2fr]">
      <UCard>
        <div class="flex flex-col items-center text-center">
          <div class="relative group">
            <UAvatar :src="user?.avatar?.url" :alt="user?.fullName" size="xl" class="mb-4" />
            <div 
              class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              @click="onAvatarClick"
            >
              <Icon v-if="!isUploading" name="lucide:camera" class="text-white size-8" />
              <Icon v-else name="svg-spinners:ring-resize" class="text-white size-8" />
            </div>
          </div>
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />

          <h2 class="text-xl font-bold">{{ user?.fullName }}</h2>
          <p class="text-sm text-gray-500">{{ user?.email }}</p>
          <p class="mt-4 text-xs text-gray-400">Member since {{ dayjs(user?.createdAt).format('MMMM YYYY') }}</p>
        </div>
      </UCard>

      <div class="space-y-8">
        <UCard>
          <template #header>
            <h3 class="font-semibold">Personal Information</h3>
          </template>
          
          <UForm :schema="personalInfoSchema" :state="personalInfoState" class="space-y-4" @submit="handlePersonalInfoSubmit">
            <UFormField label="Full Name" name="fullName">
              <UInput v-model="personalInfoState.fullName" />
            </UFormField>
            <UFormField label="Email Address">
              <UInput :model-value="user?.email" disabled />
            </UFormField>
            <UButton type="submit">Save Changes</UButton>
          </UForm>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-semibold">Account Security</h3>
          </template>
          
          <UForm :schema="passwordSchema" :state="passwordState" class="space-y-4" @submit="handlePasswordSubmit">
            <UFormField label="Current Password" name="currentPassword">
              <UInput v-model="passwordState.currentPassword" type="password" />
            </UFormField>
            <UFormField label="New Password" name="newPassword">
              <UInput v-model="passwordState.newPassword" type="password" />
            </UFormField>
            <UButton type="submit" color="neutral" variant="outline">Change Password</UButton>
          </UForm>
        </UCard>

        <SessionManager />
      </div>
    </div>
  </div>
</template>
