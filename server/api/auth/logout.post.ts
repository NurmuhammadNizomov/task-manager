import { deleteCookie, getCookie } from 'h3'
import { SessionCacheService } from '../../modules/auth/utils/session-cache'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { verifyRefreshToken } from '../../modules/auth/utils/jwt'
import { clearAuthCookies } from '../../modules/auth/utils/cookies'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'

export default defineApiHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  await connectDB(event)

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken, event)

      if (payload) {
        // Delete session from MongoDB
        await SessionCacheService.deleteSession(String(payload.sub))
      }
    } catch {
      // Ignore token parsing errors during logout.
    }
  }

  clearAuthCookies(event)

  return apiSuccess({
    message: tServer(event, 'success.loggedOut')
  })
})
