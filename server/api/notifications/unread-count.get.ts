import { defineApiHandler, apiSuccess } from '../../utils/api-response'
import { NotificationService } from '../../modules/notifications/services/notification-service'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const count = await NotificationService.getUnreadCount(auth.userId)
  return apiSuccess({ count })
})
