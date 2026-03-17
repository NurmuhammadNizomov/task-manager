import { getQuery } from 'h3'
import { defineApiHandler, apiSuccess } from '../../utils/api-response'
import { NotificationService } from '../../modules/notifications/services/notification-service'
import { z } from 'zod'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const query = getQuery(event)
  
  const limit = parseInt(query.limit as string) || 20
  const offset = parseInt(query.offset as string) || 0

  const notifications = await NotificationService.getNotifications(auth.userId, limit, offset)
  
  return apiSuccess(notifications)
})
