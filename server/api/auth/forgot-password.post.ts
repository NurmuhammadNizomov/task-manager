import { AuthService } from '../../modules/auth/services/auth-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { forgotPasswordSchema, readValidatedBody } from '../../modules/auth/utils/validation'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import type { ForgotPasswordData } from '../../modules/auth/types'

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'forgotPassword')
  const body = await readValidatedBody<ForgotPasswordData>(event, forgotPasswordSchema)

  await connectDB(event)

  await AuthService.requestPasswordReset(event, body.email)

  return apiSuccess({
    message: tServer(event, 'success.forgotPasswordSent')
  })
})
