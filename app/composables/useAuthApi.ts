import type { 
  AppLanguage, 
  ApiSuccessResponse, 
  LoginPayload, 
  LoginData, 
  RegisterPayload, 
  RegisterData, 
  PreferencesPayload, 
  PreferencesData 
} from '~/types/auth'

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
