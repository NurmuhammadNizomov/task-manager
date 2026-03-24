import { z } from 'zod'
import { apiSuccess, defineApiHandler, apiError } from '../../../utils/api-response'
import { TaskModel } from '../../../modules/tasks/models/task'
import { ProjectModel } from '../../../modules/projects/models/project'
import { readValidatedBody } from '../../../modules/auth/utils/validation'

const taskMoveSchema = z.object({
  status: z.enum(['planned', 'inProgress', 'inReview', 'done']),
  newPosition: z.number().min(0).optional()
})

export default defineApiHandler(async (event) => {
  const taskId = event.context.params?.id
  const auth = event.context.auth
  const body = await readValidatedBody(event, taskMoveSchema)

  const task = await TaskModel.findById(taskId)
  if (!task) return apiError(404, 'TASK_NOT_FOUND', 'Task not found.')

  const project = await ProjectModel.findOne({
    _id: task.project,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  })
  if (!project) return apiError(403, 'FORBIDDEN', 'You do not have access to this project.')

  const sameColumn = task.status === body.status
  const oldPosition = task.position

  if (sameColumn) {
    if (body.newPosition === undefined || body.newPosition === oldPosition) {
      return apiSuccess(task)
    }
    const newPos = body.newPosition
    if (newPos > oldPosition) {
      await TaskModel.updateMany(
        { project: task.project, status: body.status, _id: { $ne: task._id }, position: { $gt: oldPosition, $lte: newPos } },
        { $inc: { position: -1 } }
      )
    } else {
      await TaskModel.updateMany(
        { project: task.project, status: body.status, _id: { $ne: task._id }, position: { $gte: newPos, $lt: oldPosition } },
        { $inc: { position: 1 } }
      )
    }
    task.position = newPos
  } else {
    // Remove from old column
    await TaskModel.updateMany(
      { project: task.project, status: task.status, position: { $gt: oldPosition } },
      { $inc: { position: -1 } }
    )
    // Insert into new column
    const insertAt = body.newPosition ?? await TaskModel.countDocuments({ project: task.project, status: body.status })
    await TaskModel.updateMany(
      { project: task.project, status: body.status, position: { $gte: insertAt } },
      { $inc: { position: 1 } }
    )
    task.status = body.status
    task.position = insertAt
  }

  await task.save()
  return apiSuccess(task)
})
