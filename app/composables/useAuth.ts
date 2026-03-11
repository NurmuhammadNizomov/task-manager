import type { AppLanguage, AppTheme } from './useUserSettings'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  isEmailVerified?: boolean
  language?: AppLanguage
  theme?: AppTheme
}

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const accessToken = useState<string | null>('auth:token', () => null)

  const isLoggedIn = computed(() => !!accessToken.value)

  const setAuth = (token: string, authUser: AuthUser) => {
    accessToken.value = token
    user.value = authUser
    if (import.meta.client) {
      localStorage.setItem('access_token', token)
    }
  }

  const clearAuth = () => {
    accessToken.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('access_token')
    }
  }

  const initFromStorage = () => {
    if (!import.meta.client) return

    // Email tasdiqlangandan keyin server tomonidan o'rnatilgan vaqtinchalik cookie
    const verifiedToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_verified_token='))
      ?.split('=')[1]

    if (verifiedToken) {
      localStorage.setItem('access_token', verifiedToken)
      document.cookie = 'auth_verified_token=; Max-Age=0; path=/'
      accessToken.value = verifiedToken
      return
    }

    if (!accessToken.value) {
      const stored = localStorage.getItem('access_token')
      if (stored) {
        accessToken.value = stored
      }
    }
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
    accessToken,
    isLoggedIn,
    setAuth,
    clearAuth,
    initFromStorage,
    logout
  }
}
