import { getHeader } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { verifyAccessToken } from '../../modules/auth/utils/jwt'
import { readValidatedBody, updatePreferencesSchema } from '../../modules/auth/utils/validation'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'

interface PreferencesBody {
  language?: 'en' | 'ru' | 'uz'
  theme?: 'light' | 'dark' | 'system'
}

export default defineApiHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    apiError(401, 'AUTH_ACCESS_TOKEN_REQUIRED', tServer(event, 'errors.authorizationTokenRequired'))
  }

  const body = await readValidatedBody<PreferencesBody>(event, updatePreferencesSchema)

  let payload
  try {
    payload = verifyAccessToken(token, event)
  } catch {
    apiError(401, 'AUTH_INVALID_ACCESS_TOKEN', tServer(event, 'errors.invalidAccessToken'))
  }

  await connectDB(event)

  const session = await AuthSessionModel.findOne({ userId: payload.sub, accessToken: token })

  if (!session) {
    apiError(401, 'AUTH_SESSION_INVALID', tServer(event, 'errors.sessionInvalid'))
  }

  const user = await UserModel.findById(payload.sub)

  if (!user) {
    apiError(404, 'USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
  }

  if (body.language) {
    user.language = body.language
  }

  if (body.theme) {
    user.theme = body.theme
  }

  await user.save()

  return apiSuccess({
    message: tServer(event, 'success.preferencesUpdated'),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      language: user.language,
      theme: user.theme
    }
  })
})
