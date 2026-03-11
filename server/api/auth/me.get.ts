import { createError, getHeader } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { verifyAccessToken } from '../../modules/auth/utils/jwt'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization token is required' })
  }

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid access token' })
  }

  await connectDB()

  const session = await AuthSessionModel.findOne({ userId: payload.sub, accessToken: token })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Session is invalid' })
  }

  const user = await UserModel.findById(payload.sub).select('-password')

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return {
    success: true,
    user
  }
})



