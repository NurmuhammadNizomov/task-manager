import { getCookie } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { setRefreshTokenCookie } from '../../modules/auth/utils/cookies'
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
    apiError(401, 'AUTH_REFRESH_TOKEN_REQUIRED', tServer(event, 'errors.refreshTokenRequired'))
  }

  await connectDB(event)

  let payload
  try {
    payload = verifyRefreshToken(refreshToken, event)
  } catch {
    apiError(401, 'AUTH_INVALID_REFRESH_TOKEN', tServer(event, 'errors.invalidRefreshToken'))
  }

  const [user, session] = await Promise.all([
    UserModel.findById(payload.sub),
    AuthSessionModel.findOne({ userId: payload.sub, refreshToken })
  ])

  if (!user || !session) {
    apiError(401, 'AUTH_REFRESH_TOKEN_REVOKED', tServer(event, 'errors.refreshTokenNotValidAnymore'))
  }

  const newAccessToken = signAccessToken(String(user._id), user.email, event)
  const newRefreshToken = signRefreshToken(String(user._id), user.email, event)

  session.accessToken = newAccessToken
  session.refreshToken = newRefreshToken
  await session.save()

  setRefreshTokenCookie(event, newRefreshToken)

  return apiSuccess({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  })
})
