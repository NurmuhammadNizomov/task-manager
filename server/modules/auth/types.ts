export interface AuthUser {
  id: string
  fullName: string
  email: string
  isEmailVerified?: boolean
  language?: string
  theme?: string
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
  language?: string
  theme?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface ForgotPasswordData {
  email: string
}

export interface VerifyEmailOtpData {
  email: string
  otp: string
}

export interface RefreshData {
  refreshToken?: string
}

export interface ResetPasswordOtpData {
  email: string
  otp: string
  password: string
}

export interface ResetPasswordTokenData {
  token: string
  password: string
}

export interface UpdatePreferencesData {
  language?: 'en' | 'ru' | 'uz'
  theme?: 'light' | 'dark' | 'system'
}

export interface AuthJwtPayload {
  sub: string
  email: string
  type: 'access' | 'refresh'
}
