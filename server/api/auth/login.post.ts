import { UserModel } from '../../modules/auth/models/user'
import { AuthService } from '../../modules/auth/services/auth-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { loginSchema, readValidatedBody } from '../../modules/auth/utils/validation'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'
import type { LoginData } from '../../modules/auth/types'

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'login')
  const body = await readValidatedBody<LoginData>(event, loginSchema)

  await connectDB(event)

  const user = await UserModel.findOne({ email: body.email })

  if (!user) {
    return apiError(401, 'AUTH_INVALID_CREDENTIALS', tServer(event, 'errors.invalidCredentials'))
  }

  const isPasswordCorrect = await user.comparePassword(body.password)

  if (!isPasswordCorrect) {
    return apiError(401, 'AUTH_INVALID_CREDENTIALS', tServer(event, 'errors.invalidCredentials'))
  }

  if (!user.isEmailVerified) {
    return apiError(403, 'AUTH_EMAIL_NOT_VERIFIED', tServer(event, 'errors.emailNotVerified'))
  }

  await AuthService.createSession(event, user)

  return apiSuccess({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      language: user.language,
      theme: user.theme
    }
  })
})
