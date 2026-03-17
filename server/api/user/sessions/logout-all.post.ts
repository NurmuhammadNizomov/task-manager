import { getCookie } from 'h3'
import { defineApiHandler, apiSuccess } from '../../../utils/api-response'
import { AuthService } from '../../../modules/auth/services/auth-service'

export default defineApiHandler(async (event) => {
  const refreshToken = getCookie(event, 'auth:refreshToken')
  if (!refreshToken) {
    return apiSuccess({ message: 'No active sessions to log out from.' })
  }

  await AuthService.logoutAll(event, refreshToken)
  
  return apiSuccess({ message: 'Logged out from all other devices successfully.' })
})
