import { UserService } from '../../modules/auth/services/user-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { readValidatedBody, updatePreferencesSchema } from '../../modules/auth/utils/validation'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'
import type { UpdatePreferencesData } from '../../modules/auth/types'

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'updatePreferences')
  const auth = event.context.auth

  if (!auth) {
    apiError(401, 'AUTH_ACCESS_TOKEN_REQUIRED', tServer(event, 'errors.authorizationTokenRequired'))
  }

  const body = await readValidatedBody<UpdatePreferencesData>(event, updatePreferencesSchema)

  await connectDB(event)

  const user = await UserService.updatePreferences(event, auth.userId, body)

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
