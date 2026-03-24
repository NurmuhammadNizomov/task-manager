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

  const fetchUser = async () => {
    try {
      const response = await $fetch<{ status: string; data: { user: AuthUser } }>('/api/auth/me')
      if (response.status === 'success') {
        setAuth(response.data.user)
      }
    } catch (_) { /* ignore */ }
  }

  const updateUser = async (payload: { fullName?: string; bio?: string; currentPassword?: string; newPassword?: string }) => {
    const response = await $fetch<{ status: string; data: { user: AuthUser } }>('/api/user/update', {
      method: 'PATCH',
      body: payload
    })
    if (response.status === 'success') {
      setAuth(response.data.user)
    }
    return response
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (_) { /* ignore */ }
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
    fetchUser,
    updateUser,
    logout
  }
}
