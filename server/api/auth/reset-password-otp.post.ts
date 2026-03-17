import { AuthService } from '../../modules/auth/services/auth-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { readValidatedBody, resetPasswordOtpSchema } from '../../modules/auth/utils/validation'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import type { ResetPasswordOtpData } from '../../modules/auth/types'

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'resetPassword')
  const body = await readValidatedBody<ResetPasswordOtpData>(event, resetPasswordOtpSchema)

  await connectDB(event)

  await AuthService.resetPasswordOtp(event, body)

  return apiSuccess({
    message: tServer(event, 'success.passwordResetSuccess')
  })
})
