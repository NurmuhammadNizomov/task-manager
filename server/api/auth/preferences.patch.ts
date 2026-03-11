import { createError, getHeader } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { verifyAccessToken } from '../../modules/auth/utils/jwt'
import { readValidatedBody, updatePreferencesSchema } from '../../modules/auth/utils/validation'

type PreferencesBody = {
  language?: 'en' | 'ru' | 'uz'
  theme?: 'light' | 'dark' | 'system'
}

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization token is required' })
  }

  const body = await readValidatedBody<PreferencesBody>(event, updatePreferencesSchema)

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

  const user = await UserModel.findById(payload.sub)

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  if (body.language) {
    user.language = body.language
  }

  if (body.theme) {
    user.theme = body.theme
  }

  await user.save()

  return {
    success: true,
    message: 'Preferences updated successfully',
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      language: user.language,
      theme: user.theme
    }
  }
})
