import { z } from 'zod'
import { apiSuccess, defineApiHandler, apiError } from '../../../utils/api-response'
import { TaskModel, type TaskStatus } from '../../../modules/tasks/models/task'
import { ProjectModel } from '../../../modules/projects/models/project'
import { readValidatedBody } from '../../../modules/auth/utils/validation'

const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  status: z.enum(['planned', 'inProgress', 'inReview', 'done'])
})

export default defineApiHandler(async (event) => {
  const projectId = event.context.params?.id
  const auth = event.context.auth
  const body = await readValidatedBody(event, taskCreateSchema)

  // Check if user has access to this project
  const project = await ProjectModel.findOne({
    _id: projectId,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  })

  if (!project) {
    return apiError(404, 'PROJECT_NOT_FOUND', 'Project not found or you do not have access.')
  }

  // Find the highest position in the target column and add 1
  const lastTask = await TaskModel.findOne({
    project: projectId,
    status: body.status
  }).sort({ position: -1 })

  const newPosition = (lastTask?.position || 0) + 1

  const task = await TaskModel.create({
    ...body,
    project: projectId,
    position: newPosition
  })

  return apiSuccess(task)
})
