import { getCookie } from 'h3'
import { AuthService } from '../../modules/auth/services/auth-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { verifyRefreshToken } from '../../modules/auth/utils/jwt'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'

export default defineApiHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  await connectDB(event)

  let userId: string | undefined

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken, event)
      if (payload) {
        userId = String(payload.sub)
      }
    } catch {
      // Ignore token parsing errors during logout.
    }
  }

  await AuthService.logout(event, userId)

  return apiSuccess({
    message: tServer(event, 'success.loggedOut')
  })
})
