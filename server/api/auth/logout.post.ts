import { deleteCookie, getCookie } from 'h3'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { verifyRefreshToken } from '../../modules/auth/utils/jwt'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  await connectDB()

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken)

      await AuthSessionModel.findOneAndUpdate(
        { userId: payload.sub, refreshToken },
        { accessToken: null, refreshToken: null }
      )
    } catch {
      // Ignore token parsing errors during logout.
    }
  }

  deleteCookie(event, 'refresh_token', { path: '/' })

  return {
    success: true,
    message: 'Logged out successfully'
  }
})



