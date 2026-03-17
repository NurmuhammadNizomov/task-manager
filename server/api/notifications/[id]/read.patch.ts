import { defineApiHandler, apiSuccess, apiError } from '../../../utils/api-response'
import { NotificationService } from '../../../modules/notifications/services/notification-service'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const id = event.context.params?.id

  if (!id) {
    return apiError(400, 'NOTIFICATION_ID_REQUIRED', 'Notification ID is required')
  }

  const notification = await NotificationService.markAsRead(id, auth.userId)
  
  if (!notification) {
    return apiError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found')
  }

  return apiSuccess(notification)
})
