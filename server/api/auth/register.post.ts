import { AuthService } from '../../modules/auth/services/auth-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { readValidatedBody, registerSchema } from '../../modules/auth/utils/validation'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import type { RegisterData } from '../../modules/auth/types'

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'register')
  const body = await readValidatedBody<RegisterData>(event, registerSchema)

  await connectDB(event)

  const { user, mailResult } = await AuthService.register(event, body)

  return apiSuccess({
    message: mailResult.sent
      ? tServer(event, 'success.registerVerifyWithEmail')
      : tServer(event, 'success.registerVerifyResendNotConfigured'),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      language: user.language,
      theme: user.theme
    }
  })
})
