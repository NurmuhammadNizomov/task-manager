import type { H3Event } from 'h3'
import dayjs from 'dayjs'
import { UserModel, type IUser } from '../models/user'
import { AuthOtpModel } from '../models/auth-otp'
import { AuthTokenModel } from '../models/auth-token'
import { SessionCacheService } from '../utils/session-cache'
import { signAccessToken, signRefreshToken } from '../utils/jwt'
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies } from '../utils/cookies'
import { createOtpCode, hashOtpCode } from '../utils/otp'
import { createRawToken, hashToken } from '../utils/token'
import { AuthSessionModel } from '../models/auth-session'
import { SECURITY_CONFIG, VALIDATION_CONFIG } from '../../../constants'
import { tServer } from '../../../utils/i18n'
import { apiError } from '../../../utils/api-response'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/resend'
import { verifyRefreshToken } from '../utils/jwt'
import type { 
  RegisterData, 
  ResetPasswordOtpData, 
  ResetPasswordTokenData 
} from '../types'

export class AuthService {
  /**
   * Creates a new session for the user and sets authentication cookies
   */
  static async createSession(event: H3Event, user: IUser) {
    const userId = String(user._id)
    const accessToken = signAccessToken(userId, user.email, event)
    const refreshToken = signRefreshToken(userId, user.email, event)

    await SessionCacheService.createOrUpdateSession(userId, accessToken, refreshToken)

    setAccessTokenCookie(event, accessToken)
    setRefreshTokenCookie(event, refreshToken)

    return { accessToken, refreshToken }
  }

  /**
   * Refreshes an existing session using a refresh token
   */
  static async refreshSession(event: H3Event, refreshToken: string) {
    let payload
    try {
      payload = verifyRefreshToken(refreshToken, event)
    } catch {
      clearAuthCookies(event)
      apiError(401, 'AUTH_INVALID_REFRESH_TOKEN', tServer(event, 'errors.invalidRefreshToken'))
    }

    if (!payload) {
      clearAuthCookies(event)
      apiError(401, 'AUTH_INVALID_REFRESH_TOKEN', tServer(event, 'errors.invalidRefreshToken'))
    }

    const refreshTokenHash = hashToken(refreshToken)
    const session = await AuthSessionModel.findOne({ refreshTokenHash })

    if (!session) {
      clearAuthCookies(event)
      apiError(401, 'AUTH_SESSION_EXPIRED', tServer(event, 'errors.sessionExpired'))
    }

    const user = await UserModel.findById(session.userId)
    if (!user) {
      await AuthSessionModel.deleteOne({ _id: session._id })
      clearAuthCookies(event)
      apiError(404, 'AUTH_USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
    }

    // Update session activity
    session.lastUsedAt = new Date()
    await session.save()

    const newAccessToken = signAccessToken(String(user._id), user.email, event)
    setAccessTokenCookie(event, newAccessToken)

    return {
      accessToken: newAccessToken
    }
  }

  /**
   * Handles user registration logic
   */
  static async register(event: H3Event, data: RegisterData) {
    const existingUser = await UserModel.findOne({ email: data.email }).lean()
    if (existingUser) {
      apiError(409, 'AUTH_USER_ALREADY_EXISTS', tServer(event, 'errors.userAlreadyExists'))
    }

    const user = await UserModel.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      isEmailVerified: false,
      language: data.language ?? 'en',
      theme: data.theme ?? 'light'
    })

    const verificationTokenRaw = createRawToken()
    const verificationTokenHash = hashToken(verificationTokenRaw)
    const verificationOtpCode = createOtpCode()
    const verificationOtpHash = hashOtpCode(verificationOtpCode)

    await Promise.all([
      AuthTokenModel.findOneAndUpdate(
        { userId: user._id },
        {
          emailVerificationToken: verificationTokenHash,
          emailVerificationExpires: dayjs().add(SECURITY_CONFIG.EMAIL_VERIFY_TOKEN_LIFETIME_MS, 'ms').toDate()
        },
        { upsert: true }
      ),
      AuthOtpModel.findOneAndUpdate(
        { userId: user._id, purpose: 'email_verification' },
        {
          otpHash: verificationOtpHash,
          expiresAt: dayjs().add(SECURITY_CONFIG.EMAIL_VERIFY_OTP_LIFETIME_MS, 'ms').toDate(),
          consumedAt: null
        },
        { upsert: true }
      )
    ])

    const mailResult = await sendVerificationEmail({
      to: user.email,
      fullName: user.fullName,
      token: verificationTokenRaw,
      otpCode: verificationOtpCode
    })

    return { user, mailResult }
  }

  /**
   * Verifies user email using OTP
   */
  static async verifyEmailOtp(event: H3Event, email: string, otp: string) {
    const user = await UserModel.findOne({ email })
    if (!user) {
      apiError(400, 'AUTH_OTP_INVALID_OR_EXPIRED', tServer(event, 'errors.otpInvalidOrExpired'))
    }

    if (user.isEmailVerified) return user

    const otpEntry = await AuthOtpModel.findOne({
      userId: user._id,
      purpose: 'email_verification',
      consumedAt: null,
      expiresAt: { $gt: dayjs().toDate() }
    })

    if (!otpEntry) {
      apiError(400, 'AUTH_OTP_INVALID_OR_EXPIRED', tServer(event, 'errors.otpInvalidOrExpired'))
    }

    const otpHash = hashOtpCode(otp)
    if (otpEntry.codeHash !== otpHash) {
      otpEntry.attempts += 1
      if (otpEntry.attempts >= VALIDATION_CONFIG.MAX_OTP_ATTEMPTS) {
        otpEntry.expiresAt = dayjs().toDate()
      }
      await otpEntry.save()
      apiError(400, 'AUTH_OTP_INVALID_OR_EXPIRED', tServer(event, 'errors.otpInvalidOrExpired'))
    }

    user.isEmailVerified = true
    otpEntry.consumedAt = dayjs().toDate()

    await Promise.all([
      user.save(),
      otpEntry.save(),
      AuthTokenModel.findOneAndUpdate(
        { userId: user._id },
        { emailVerificationToken: null, emailVerificationExpires: null }
      )
    ])

    return user
  }

  /**
   * Handles password reset request
   */
  static async requestPasswordReset(event: H3Event, email: string) {
    const user = await UserModel.findOne({ email })
    if (!user) return // For security reasons, don't throw error if user not found

    const rawToken = createRawToken()
    const tokenHash = hashToken(rawToken)
    const otpCode = createOtpCode()
    const otpHash = hashOtpCode(otpCode)

    await Promise.all([
      AuthTokenModel.findOneAndUpdate(
        { userId: user._id },
        {
          passwordResetToken: tokenHash,
          passwordResetExpires: dayjs().add(SECURITY_CONFIG.PASSWORD_RESET_TOKEN_LIFETIME_MS, 'ms').toDate()
        },
        { upsert: true }
      ),
      AuthOtpModel.findOneAndUpdate(
        { userId: user._id, purpose: 'password_reset' },
        {
          codeHash: otpHash,
          expiresAt: dayjs().add(SECURITY_CONFIG.PASSWORD_RESET_OTP_LIFETIME_MS, 'ms').toDate(),
          attempts: 0,
          consumedAt: null
        },
        { upsert: true }
      )
    ])

    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      token: rawToken,
      otpCode
    })
  }

  /**
   * Resets user password using OTP
   */
  static async resetPasswordOtp(event: H3Event, data: ResetPasswordOtpData) {
    const user = await UserModel.findOne({ email: data.email })
    if (!user) {
      apiError(400, 'AUTH_OTP_INVALID_OR_EXPIRED', tServer(event, 'errors.otpInvalidOrExpired'))
    }

    const otpEntry = await AuthOtpModel.findOne({
      userId: user._id,
      purpose: 'password_reset',
      consumedAt: null,
      expiresAt: { $gt: dayjs().toDate() }
    })

    if (!otpEntry) {
      apiError(400, 'AUTH_OTP_INVALID_OR_EXPIRED', tServer(event, 'errors.otpInvalidOrExpired'))
    }

    const otpHash = hashOtpCode(data.otp)
    if (otpEntry.codeHash !== otpHash) {
      otpEntry.attempts += 1
      if (otpEntry.attempts >= VALIDATION_CONFIG.MAX_OTP_ATTEMPTS) {
        otpEntry.expiresAt = dayjs().toDate()
      }
      await otpEntry.save()
      apiError(400, 'AUTH_OTP_INVALID_OR_EXPIRED', tServer(event, 'errors.otpInvalidOrExpired'))
    }

    user.password = data.password
    otpEntry.consumedAt = dayjs().toDate()

    await Promise.all([
      user.save(),
      otpEntry.save(),
      AuthTokenModel.findOneAndUpdate(
        { userId: user._id },
        { passwordResetToken: null, passwordResetExpires: null }
      ),
      AuthSessionModel.findOneAndUpdate(
        { userId: user._id },
        { accessToken: null, refreshToken: null }
      )
    ])

    clearAuthCookies(event)
    return user
  }

  /**
   * Verifies user email using a verification token
   */
  static async verifyEmailToken(event: H3Event, token: string) {
    const securityToken = await AuthTokenModel.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: dayjs().toDate() }
    })

    if (!securityToken) {
      apiError(
        400,
        'AUTH_VERIFICATION_TOKEN_INVALID_OR_EXPIRED',
        tServer(event, 'errors.verificationTokenInvalidOrExpired')
      )
    }

    const user = await UserModel.findById(securityToken.userId)
    if (!user) {
      apiError(404, 'USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
    }

    user.isEmailVerified = true
    await user.save()

    securityToken.emailVerificationToken = null
    securityToken.emailVerificationExpires = null
    await securityToken.save()

    await this.createSession(event, user)
    return user
  }

  /**
   * Resets user password using a reset token
   */
  static async resetPasswordToken(event: H3Event, data: ResetPasswordTokenData) {
    const tokenHash = hashToken(data.token)
    const securityToken = await AuthTokenModel.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: dayjs().toDate() }
    })

    if (!securityToken) {
      apiError(
        400,
        'AUTH_RESET_TOKEN_INVALID_OR_EXPIRED',
        tServer(event, 'errors.resetTokenInvalidOrExpired')
      )
    }

    const user = await UserModel.findById(securityToken.userId)
    if (!user) {
      apiError(404, 'USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
    }

    user.password = data.password
    await user.save()

    securityToken.passwordResetToken = null
    securityToken.passwordResetExpires = null
    await securityToken.save()

    await AuthSessionModel.findOneAndUpdate(
      { userId: user._id },
      { accessToken: null, refreshToken: null }
    )

    clearAuthCookies(event)
    return user
  }

  /**
   * Handles user logout and clears session
   */
  static async logout(event: H3Event, userId?: string) {
    if (userId) {
      await SessionCacheService.deleteSession(userId)
    }
    clearAuthCookies(event)
  }

  static async logoutAll(event: H3Event, _refreshToken?: string) {
    const auth = event.context.auth
    if (auth?.userId) {
      await SessionCacheService.deleteSession(String(auth.userId))
    }
    clearAuthCookies(event)
  }
}
