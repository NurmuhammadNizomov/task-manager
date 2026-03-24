import type { Document, Types } from 'mongoose'

export type UserLanguage = 'en' | 'ru' | 'uz'
export type UserTheme = 'light' | 'dark' | 'system'

export type AuthType = 'email' | 'google' | 'linked'

export interface IUser extends Document {
  fullName: string
  email: string
  password?: string
  googleId?: string
  authType: AuthType
  isEmailVerified: boolean

  bio?: string
  avatar?: {
    publicId: string
    url: string
  }
  language: UserLanguage
  theme: UserTheme
  comparePassword(candidatePassword: string): Promise<boolean>
}

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
  language?: UserLanguage
  theme?: UserTheme
}

export interface AuthJwtPayload {
  sub: string
  email: string
  type: 'access' | 'refresh'
}

export interface IAuthSession extends Document {
  userId: Types.ObjectId
  accessToken: string
  refreshTokenHash: string
  lastUsedAt: Date
  createdAt: Date
  updatedAt: Date
}
