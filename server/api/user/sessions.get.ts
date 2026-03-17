import { defineApiHandler, apiSuccess } from '../../utils/api-response'
import { AuthSessionModel } from '../../modules/auth/models/auth-session'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  
  const sessions = await AuthSessionModel.find({ userId: auth.userId })
    .sort({ lastUsedAt: -1 })
    .lean()

  return apiSuccess(sessions)
})
