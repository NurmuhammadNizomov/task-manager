import { getQuery } from 'h3'
import { AuthService } from '../../modules/auth/services/auth-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { sanitizeToken } from '../../utils/sanitization'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'verifyEmail')
  const query = getQuery(event)
  const token = sanitizeToken(String(query.token || ''))

  if (!token) {
    return apiError(
      400,
      'AUTH_VERIFICATION_TOKEN_REQUIRED',
      tServer(event, 'errors.verificationTokenRequired')
    )
  }

  await connectDB(event)

  const user = await AuthService.verifyEmailToken(event, token)

  return apiSuccess({
    user: {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      isEmailVerified: user.isEmailVerified
    }
  })
})