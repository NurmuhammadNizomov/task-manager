import { getCookie } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { SessionCacheService } from '../../modules/auth/utils/session-cache'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { setRefreshTokenCookie, setAccessTokenCookie } from '../../modules/auth/utils/cookies'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../modules/auth/utils/jwt'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { readValidatedBody, refreshSchema } from '../../modules/auth/utils/validation'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'

interface RefreshBody {
  refreshToken?: string
}

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'refresh')

  const body = await readValidatedBody<RefreshBody>(event, refreshSchema)
  const refreshToken = body.refreshToken || getCookie(event, 'refresh_token')

  if (!refreshToken) {
    return apiError(401, 'AUTH_REFRESH_TOKEN_REQUIRED', tServer(event, 'errors.refreshTokenRequired'))
  }

  await connectDB(event)

  let payload
  try {
    payload = verifyRefreshToken(refreshToken, event)
  } catch {
    return apiError(401, 'AUTH_INVALID_REFRESH_TOKEN', tServer(event, 'errors.invalidRefreshToken'))
  }

  if (!payload) {
    return apiError(401, 'AUTH_INVALID_REFRESH_TOKEN', tServer(event, 'errors.invalidRefreshToken'))
  }

  const [user, session] = await Promise.all([
    UserModel.findById(payload.sub),
    SessionCacheService.getSession(String(payload.sub))
  ])

  if (!user || !session || session.refreshToken !== refreshToken) {
    return apiError(401, 'AUTH_REFRESH_TOKEN_REVOKED', tServer(event, 'errors.refreshTokenNotValidAnymore'))
  }

  const newAccessToken = signAccessToken(String(user._id), user.email, event)
  const newRefreshToken = signRefreshToken(String(user._id), user.email, event)

  // Update session in MongoDB
  await SessionCacheService.createOrUpdateSession(
    String(user._id),
    newAccessToken,
    newRefreshToken
  )

  setRefreshTokenCookie(event, newRefreshToken)
  setAccessTokenCookie(event, newAccessToken)

  return apiSuccess({
    success: true
  })
})
