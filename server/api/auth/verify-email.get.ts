import { getQuery, sendRedirect, setCookie } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { hashToken } from '../../modules/auth/utils/token'
import { signAccessToken, signRefreshToken } from '../../modules/auth/utils/jwt'
import { setRefreshTokenCookie } from '../../modules/auth/utils/cookies'
import { apiError } from '../../utils/api-response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = String(query.token || '')

  if (!token) {
    apiError(
      400,
      'AUTH_VERIFICATION_TOKEN_REQUIRED',
      tServer(event, 'errors.verificationTokenRequired')
    )
  }

  await connectDB(event)

  const securityToken = await AuthTokenModel.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() }
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

  // Auto-login: access + refresh token yaratib sessiyaga saqlaymiz
  const accessToken = signAccessToken(String(user._id), user.email, event)
  const refreshToken = signRefreshToken(String(user._id), user.email, event)

  await AuthSessionModel.findOneAndUpdate(
    { userId: user._id },
    { accessToken, refreshToken },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  )

  setRefreshTokenCookie(event, refreshToken)

  // Access tokenni 5 daqiqalik cookie sifatida o'rnatamiz — client localStorage ga ko'chiradi
  setCookie(event, 'auth_verified_token', accessToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 5
  })

  return sendRedirect(event, '/dashboard')
})



