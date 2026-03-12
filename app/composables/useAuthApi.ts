import type { AppLanguage, AppTheme } from './useUserSettings'

interface ApiMeta {
  [key: string]: unknown
}

interface ApiSuccessResponse<TData, TMeta extends ApiMeta = ApiMeta> {
  status: 'success'
  data: TData
  meta: TMeta
}

interface AuthUser {
  id: string
  fullName: string
  email: string
  isEmailVerified?: boolean
  language?: AppLanguage
  theme?: AppTheme
}

interface LoginPayload {
  email: string
  password: string
}

interface LoginData {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

interface RegisterPayload {
  fullName: string
  email: string
  password: string
  language?: AppLanguage
  theme?: AppTheme
}

interface RegisterData {
  message: string
  user: AuthUser
}

interface PreferencesPayload {
  language?: AppLanguage
  theme?: AppTheme
}

interface PreferencesData {
  message: string
  user: AuthUser
}

export const useAuthApi = () => {
  const { locale } = useI18n()

  const resolveLocale = (): AppLanguage => {
    const value = String(locale.value || 'en').toLowerCase()

    if (value.startsWith('ru')) {
      return 'ru'
    }

    if (value.startsWith('uz')) {
      return 'uz'
    }

    return 'en'
  }

  const withLocaleHeader = (headers: Record<string, string> = {}) => {
    return {
      ...headers,
      'x-locale': resolveLocale()
    }
  }

  const login = (payload: LoginPayload) => {
    return $fetch<ApiSuccessResponse<LoginData>>('/api/auth/login', {
      method: 'POST',
      headers: withLocaleHeader(),
      body: payload
    })
  }

  const register = (payload: RegisterPayload) => {
    return $fetch<ApiSuccessResponse<RegisterData>>('/api/auth/register', {
      method: 'POST',
      headers: withLocaleHeader(),
      body: payload
    })
  }

  const updatePreferences = (payload: PreferencesPayload) => {
    return $fetch<ApiSuccessResponse<PreferencesData>>('/api/auth/preferences', {
      method: 'PATCH',
      headers: withLocaleHeader(),
      body: payload
    })
  }

  return {
    login,
    register,
    updatePreferences
  }
}
