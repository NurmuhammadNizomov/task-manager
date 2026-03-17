import type { AuthUser } from '~/types/auth'

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const isAuthenticated = useState<boolean>('auth:authenticated', () => false)

  const isLoggedIn = computed(() => isAuthenticated.value)

  const setAuth = (authUser: AuthUser) => {
    user.value = authUser
    isAuthenticated.value = true
  }

  const clearAuth = () => {
    user.value = null
    isAuthenticated.value = false
  }

  const initFromStorage = () => {
    // With httpOnly cookies, we don't need client-side storage initialization
    // Authentication state will be determined by server API calls
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    clearAuth()
    await navigateTo('/login')
  }

  return {
    user,
    isAuthenticated,
    isLoggedIn,
    setAuth,
    clearAuth,
    initFromStorage,
    logout
  }
}
