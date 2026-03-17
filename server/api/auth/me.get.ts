import { UserService } from '../../modules/auth/services/user-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth

  if (!auth) {
    return apiError(401, 'AUTH_ACCESS_TOKEN_REQUIRED', tServer(event, 'errors.authorizationTokenRequired'))
  }

  await connectDB(event)

  const user = await UserService.getUserById(event, auth.userId)

  return apiSuccess({
    user
  })
})
