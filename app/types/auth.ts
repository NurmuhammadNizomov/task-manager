export type AppLanguage = 'en' | 'ru' | 'uz'
export type AppTheme = 'light' | 'dark' | 'system'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  isEmailVerified?: boolean
  bio?: string
  language?: AppLanguage
  theme?: AppTheme
  avatar?: {
    publicId: string
    url: string
  }
  createdAt?: string
}

export interface ApiMeta {
  [key: string]: unknown
}

export interface ApiSuccessResponse<TData, TMeta extends ApiMeta = ApiMeta> {
  status: 'success'
  data: TData
  meta: TMeta
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginData {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  language?: AppLanguage
  theme?: AppTheme
}

export interface RegisterData {
  message: string
  user: AuthUser
}

export interface PreferencesPayload {
  language?: AppLanguage
  theme?: AppTheme
}

export interface PreferencesData {
  message: string
  user: AuthUser
}
