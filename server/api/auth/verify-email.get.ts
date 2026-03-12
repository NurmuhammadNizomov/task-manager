import { getQuery } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { SessionCacheService } from '../../modules/auth/utils/session-cache'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { hashToken } from '../../modules/auth/utils/token'
import { signAccessToken, signRefreshToken } from '../../modules/auth/utils/jwt'
import { setRefreshTokenCookie, setAccessTokenCookie } from '../../modules/auth/utils/cookies'
import { sanitizeToken } from '../../utils/sanitization'
import { apiError } from '../../utils/api-response'

export default defineEventHandler(async (event) => {
  console.log('[VerifyEmail API] Hit endpoint')
  const query = getQuery(event)
  const token = sanitizeToken(String(query.token || ''))
  console.log('[VerifyEmail API] Extracted token:', token ? token.substring(0, 10) + '...' : 'none')

  if (!token) {
    return apiError(
      400,
      'AUTH_VERIFICATION_TOKEN_REQUIRED',
      tServer(event, 'errors.verificationTokenRequired')
    )
  }

  console.log('[VerifyEmail API] Connecting to DB...')
  await connectDB(event)
  console.log('[VerifyEmail API] Connected to DB.')

  console.log('[VerifyEmail API] Finding AuthTokenModel...')
  const securityToken = await AuthTokenModel.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() }
  })
  console.log('[VerifyEmail API] Found AuthToken:', !!securityToken)

  if (!securityToken) {
    return apiError(
      400,
      'AUTH_VERIFICATION_TOKEN_INVALID_OR_EXPIRED',
      tServer(event, 'errors.verificationTokenInvalidOrExpired')
    )
  }

  console.log('[VerifyEmail API] Finding User...')
  const user = await UserModel.findById(securityToken.userId)
  console.log('[VerifyEmail API] Found User:', !!user)

  if (!user) {
    return apiError(404, 'USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
  }

  console.log('[VerifyEmail API] Updating User...')
  user.isEmailVerified = true
  await user.save()
  console.log('[VerifyEmail API] user.save() done.')

  securityToken.emailVerificationToken = null
  securityToken.emailVerificationExpires = null
  await securityToken.save()
  console.log('[VerifyEmail API] securityToken.save() done.')

  const accessToken = signAccessToken(String(user._id), user.email, event)
  const refreshToken = signRefreshToken(String(user._id), user.email, event)
  console.log('[VerifyEmail API] Tokens signed.')

  await SessionCacheService.createOrUpdateSession(
    String(user._id),
    accessToken,
    refreshToken
  )
  console.log('[VerifyEmail API] Session updated in cache.')

  setRefreshTokenCookie(event, refreshToken)
  setAccessTokenCookie(event, accessToken)

  console.log('[VerifyEmail API] Success, returning response.')
  return {
    status: 'success',
    data: {
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    }
  }
})