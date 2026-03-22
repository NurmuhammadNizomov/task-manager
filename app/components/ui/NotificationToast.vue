<script setup lang="ts">
interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const toasts = ref<Toast[]>([])

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Date.now().toString()
  const newToast = { ...toast, id }
  
  toasts.value.push(newToast)
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(id)
  }, toast.duration || 5000)
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose globally
provide('toast', { addToast, removeToast })
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup
      name="toast"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="max-w-sm shadow-lg p-4 backdrop-blur-sm border transition-all duration-300"
        :style="{
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          backgroundColor: toast.type === 'success' ? 'var(--color-accent-50)' : 
                         toast.type === 'error' ? 'var(--color-error)' : 
                         toast.type === 'warning' ? 'var(--color-warning)' : 
                         'var(--color-primary-50)',
          borderColor: toast.type === 'success' ? 'var(--color-accent-200)' : 
                       toast.type === 'error' ? '#dc2626' : 
                       toast.type === 'warning' ? '#f59e0b' : 
                       'var(--color-primary-200)',
          color: toast.type === 'success' ? 'var(--color-accent-800)' : 
                 toast.type === 'error' ? 'white' : 
                 toast.type === 'warning' ? 'var(--color-gray-900)' : 
                 'var(--color-primary-800)'
        }"
      >
        <div class="flex items-start gap-3">
          <Icon 
            :name="{
              success: 'lucide:check-circle',
              error: 'lucide:x-circle',
              warning: 'lucide:alert-triangle',
              info: 'lucide:info'
            }[toast.type]"
            class="flex-shrink-0 mt-0.5"
            :style="{ fontSize: 'var(--font-size-lg)' }"
          />
          <div class="flex-1 min-w-0">
            <h4 :style="{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }">{{ toast.title }}</h4>
            <p v-if="toast.message" class="mt-1 opacity-90" :style="{ fontSize: 'var(--font-size-sm)' }">{{ toast.message }}</p>
          </div>
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 p-1 rounded-md hover:opacity-80 transition-opacity"
            :style="{ borderRadius: 'var(--radius-md)' }"
          >
            <Icon name="lucide:x" :style="{ fontSize: 'var(--font-size-sm)' }" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-300) ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform var(--duration-300) ease;
}
</style>
