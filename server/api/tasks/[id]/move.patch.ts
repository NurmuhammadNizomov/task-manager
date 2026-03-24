import { z } from 'zod'
import { apiSuccess, defineApiHandler, apiError } from '../../../utils/api-response'
import { TaskModel } from '../../../modules/tasks/models/task'
import { ProjectModel } from '../../../modules/projects/models/project'
import { readValidatedBody } from '../../../modules/auth/utils/validation'

const taskMoveSchema = z.object({
  status: z.enum(['planned', 'inProgress', 'inReview', 'done'])
})

export default defineApiHandler(async (event) => {
  const taskId = event.context.params?.id
  const auth = event.context.auth
  const body = await readValidatedBody(event, taskMoveSchema)

  const task = await TaskModel.findById(taskId)
  if (!task) {
    return apiError(404, 'TASK_NOT_FOUND', 'Task not found.')
  }

  const project = await ProjectModel.findOne({
    _id: task.project,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  })

  if (!project) {
    return apiError(403, 'FORBIDDEN', 'You do not have access to this project.')
  }

  if (task.status !== body.status) {
    // Place the task at the end of the target column
    const maxPos = await TaskModel.countDocuments({ project: task.project, status: body.status })
    task.status = body.status
    task.position = maxPos
    await task.save()
  }

  return apiSuccess(task)
})
