<script setup lang="ts">
const { user } = useAuth()

const STORAGE_KEY = 'onboarding_completed'
const isVisible = ref(false)
const currentStep = ref(0)

const steps = [
  {
    icon: 'lucide:layout-dashboard',
    title: 'Welcome to your Dashboard',
    desc: 'This is your home base. See all your projects and tasks at a glance.',
    color: 'primary'
  },
  {
    icon: 'lucide:folder-plus',
    title: 'Create your first project',
    desc: 'Click "New Project" to organize your work into projects. Each project has its own Kanban board.',
    color: 'blue'
  },
  {
    icon: 'lucide:kanban',
    title: 'Manage tasks visually',
    desc: 'Drag and drop tasks between Planned, In Progress, In Review, and Done columns.',
    color: 'purple'
  },
  {
    icon: 'lucide:users',
    title: 'Invite your team',
    desc: 'Open any project → Settings tab → add teammates by email to collaborate.',
    color: 'green'
  },
  {
    icon: 'lucide:check-circle-2',
    title: "You're all set!",
    desc: 'Start by creating your first project. Good luck! 🚀',
    color: 'success'
  }
]

const isLastStep = computed(() => currentStep.value === steps.length - 1)
const progress = computed(() => ((currentStep.value + 1) / steps.length) * 100)

const next = () => {
  if (isLastStep.value) {
    finish()
  } else {
    currentStep.value++
  }
}

const finish = () => {
  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY, '1')
  }
  isVisible.value = false
}

onMounted(() => {
  if (!import.meta.client) return
  const done = localStorage.getItem(STORAGE_KEY)
  if (!done && user.value) {
    setTimeout(() => { isVisible.value = true }, 800)
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-6 right-6 z-50 w-80 rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700"
    >
      <!-- Progress bar -->
      <div class="h-1 rounded-t-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          class="h-full bg-primary-500 transition-all duration-300"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <div class="p-5">
        <!-- Close button -->
        <button
          class="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          @click="finish"
        >
          <Icon name="lucide:x" class="size-3.5" />
        </button>

        <!-- Step indicator -->
        <p class="mb-3 text-xs font-medium text-gray-400">
          Step {{ currentStep + 1 }} of {{ steps.length }}
        </p>

        <!-- Content -->
        <div class="flex gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
            <Icon :name="steps[currentStep].icon" class="size-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white text-sm">
              {{ steps[currentStep].title }}
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {{ steps[currentStep].desc }}
            </p>
          </div>
        </div>

        <!-- Dot indicators + Next button -->
        <div class="mt-4 flex items-center justify-between">
          <div class="flex gap-1.5">
            <button
              v-for="(_, i) in steps"
              :key="i"
              class="h-1.5 rounded-full transition-all duration-200"
              :class="i === currentStep ? 'w-5 bg-primary-500' : 'w-1.5 bg-gray-200 dark:bg-gray-700'"
              @click="currentStep = i"
            />
          </div>
          <UButton size="sm" @click="next">
            {{ isLastStep ? "Get started" : "Next" }}
            <Icon v-if="!isLastStep" name="lucide:arrow-right" class="ml-1 size-3.5" />
          </UButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
