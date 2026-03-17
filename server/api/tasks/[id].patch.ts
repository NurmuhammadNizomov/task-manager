import { z } from 'zod'
import { apiSuccess, defineApiHandler, apiError } from '../../utils/api-response'
import { TaskModel } from '../../modules/tasks/models/task'
import { ProjectModel } from '../../modules/projects/models/project'
import { readValidatedBody } from '../../modules/auth/utils/validation'
import { NotificationService } from '../../modules/notifications/services/notification-service'

const taskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['planned', 'inProgress', 'inReview', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assignee: z.string().optional().nullable()
})

export default defineApiHandler(async (event) => {
  const taskId = event.context.params?.id
  const auth = event.context.auth
  const body = await readValidatedBody(event, taskUpdateSchema)

  const task = await TaskModel.findById(taskId)
  if (!task) {
    return apiError(404, 'TASK_NOT_FOUND', 'Task not found.')
  }

  // Check if user has access to the project this task belongs to
  const project = await ProjectModel.findOne({
    _id: task.project,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  })

  if (!project) {
    return apiError(403, 'FORBIDDEN', 'You do not have access to this project.')
  }

  const oldAssignee = task.assignee?.toString()
  const newAssignee = body.assignee

  // Update only the fields that are present in the body
  Object.assign(task, body)

  await task.save()

  // Send notification if assignee changed and it's not the current user assigning to themselves
  if (newAssignee && newAssignee !== oldAssignee && newAssignee !== auth.userId) {
    await NotificationService.createNotification({
      recipient: newAssignee,
      sender: auth.userId,
      type: 'task_assigned',
      title: 'New task assigned',
      message: `You have been assigned to task: ${task.title}`,
      link: `/projects/${task.project}`
    })
  }

  return apiSuccess(task)
})
