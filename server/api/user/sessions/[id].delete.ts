import { defineApiHandler, apiSuccess, apiError } from '../../../utils/api-response'
import { AuthSessionModel } from '../../../modules/auth/models/auth-session'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const sessionId = event.context.params?.id

  if (!sessionId) {
    return apiError(400, 'SESSION_ID_REQUIRED', 'Session ID is required.')
  }

  const result = await AuthSessionModel.deleteOne({
    _id: sessionId,
    userId: auth.userId
  })

  if (result.deletedCount === 0) {
    return apiError(404, 'SESSION_NOT_FOUND', 'Session not found or you do not have permission to delete it.')
  }

  return apiSuccess({ message: 'Session revoked successfully.' })
})
