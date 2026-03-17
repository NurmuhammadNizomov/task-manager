import { getCookie } from 'h3'
import { AuthService } from '../../modules/auth/services/auth-service'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { readValidatedBody, refreshSchema } from '../../modules/auth/utils/validation'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'
import type { RefreshData } from '../../modules/auth/types'

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'refresh')

  const body = await readValidatedBody<RefreshData>(event, refreshSchema)
  const refreshToken = body.refreshToken || getCookie(event, 'refresh_token')

  if (!refreshToken) {
    return apiError(401, 'AUTH_REFRESH_TOKEN_REQUIRED', tServer(event, 'errors.refreshTokenRequired'))
  }

  await connectDB(event)

  await AuthService.refreshSession(event, refreshToken)

  return apiSuccess({
    success: true
  })
})
