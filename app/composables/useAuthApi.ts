import type { AppLanguage, AppTheme } from './useUserSettings'

type AuthUser = {
  id: string
  fullName: string
  email: string
  isEmailVerified?: boolean
  language?: AppLanguage
  theme?: AppTheme
}

type LoginResponse = {
  success: boolean
  accessToken: string
  refreshToken: string
  user: AuthUser
}

type RegisterResponse = {
  success: boolean
  message: string
  user: AuthUser
}

export const useAuthApi = () => {
  const login = (payload: { email: string; password: string }) => {
    return $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: payload
    })
  }

  const register = (payload: {
    fullName: string
    email: string
    password: string
    language?: AppLanguage
    theme?: AppTheme
  }) => {
    return $fetch<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: payload
    })
  }

  const updatePreferences = (
    accessToken: string,
    payload: { language?: AppLanguage; theme?: AppTheme }
  ) => {
    return $fetch('/api/auth/preferences', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: payload
    })
  }

  return {
    login,
    register,
    updatePreferences
  }
}
