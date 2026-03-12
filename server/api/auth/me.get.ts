import { getHeader, getCookie } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { SessionCacheService } from '../../modules/auth/utils/session-cache'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { verifyAccessToken } from '../../modules/auth/utils/jwt'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'

export default defineApiHandler(async (event) => {
  // Try to get token from Authorization header first, then from cookie
  const authHeader = getHeader(event, 'authorization') || ''
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const cookieToken = getCookie(event, 'access_token') || ''
  const token = headerToken || cookieToken

  if (!token) {
    return apiError(401, 'AUTH_ACCESS_TOKEN_REQUIRED', tServer(event, 'errors.authorizationTokenRequired'))
  }

  let payload
  try {
    payload = verifyAccessToken(token, event)
  } catch {
    return apiError(401, 'AUTH_INVALID_ACCESS_TOKEN', tServer(event, 'errors.invalidAccessToken'))
  }

  if (!payload) {
    return apiError(401, 'AUTH_INVALID_ACCESS_TOKEN', tServer(event, 'errors.invalidAccessToken'))
  }

  await connectDB(event)

  const session = await SessionCacheService.getSession(String(payload.sub))

  if (!session || session.accessToken !== token) {
    return apiError(401, 'AUTH_SESSION_INVALID', tServer(event, 'errors.sessionInvalid'))
  }

  const user = await UserModel.findById(payload.sub).select('-password')

  if (!user) {
    return apiError(404, 'USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
  }

  return apiSuccess({
    user
  })
})
