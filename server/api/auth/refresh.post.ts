import { createError, getCookie } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { setRefreshTokenCookie } from '../../modules/auth/utils/cookies'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../modules/auth/utils/jwt'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { readValidatedBody, refreshSchema } from '../../modules/auth/utils/validation'

type RefreshBody = {
  refreshToken?: string
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'refresh')

  const body = await readValidatedBody<RefreshBody>(event, refreshSchema)
  const refreshToken = body.refreshToken || getCookie(event, 'refresh_token')

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh token is required'
    })
  }

  await connectDB()

  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid refresh token'
    })
  }

  const [user, session] = await Promise.all([
    UserModel.findById(payload.sub),
    AuthSessionModel.findOne({ userId: payload.sub, refreshToken })
  ])

  if (!user || !session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh token is not valid anymore'
    })
  }

  const newAccessToken = signAccessToken(String(user._id), user.email)
  const newRefreshToken = signRefreshToken(String(user._id), user.email)

  session.accessToken = newAccessToken
  session.refreshToken = newRefreshToken
  await session.save()

  setRefreshTokenCookie(event, newRefreshToken)

  return {
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  }
})



