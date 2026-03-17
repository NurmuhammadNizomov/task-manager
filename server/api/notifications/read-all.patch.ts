import { defineApiHandler, apiSuccess } from '../../utils/api-response'
import { NotificationService } from '../../modules/notifications/services/notification-service'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  await NotificationService.markAllAsRead(auth.userId)
  return apiSuccess({ message: 'All notifications marked as read' })
})
