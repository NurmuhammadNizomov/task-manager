import { deleteCookie, getCookie } from 'h3'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { verifyRefreshToken } from '../../modules/auth/utils/jwt'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'

export default defineApiHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  await connectDB(event)

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken, event)

      await AuthSessionModel.findOneAndUpdate(
        { userId: payload.sub, refreshToken },
        { accessToken: null, refreshToken: null }
      )
    } catch {
      // Ignore token parsing errors during logout.
    }
  }

  deleteCookie(event, 'refresh_token', { path: '/' })

  return apiSuccess({
    message: tServer(event, 'success.loggedOut')
  })
})
