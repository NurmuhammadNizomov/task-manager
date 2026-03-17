import { AuthService } from '../../modules/auth/services/auth-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { readValidatedBody, verifyEmailOtpSchema } from '../../modules/auth/utils/validation'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import type { VerifyEmailOtpData } from '../../modules/auth/types'

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'verifyEmail')
  const body = await readValidatedBody<VerifyEmailOtpData>(event, verifyEmailOtpSchema)

  await connectDB(event)

  await AuthService.verifyEmailOtp(event, body.email, body.otp)

  return apiSuccess({
    message: tServer(event, 'success.emailVerifiedSuccess')
  })
})
