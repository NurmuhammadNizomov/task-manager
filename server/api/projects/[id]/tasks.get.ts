import { apiSuccess, defineApiHandler } from '../../../utils/api-response'
import { TaskModel } from '../../../modules/tasks/models/task'
import { ProjectModel } from '../../../modules/projects/models/project'
import { apiError } from '../../../utils/api-response'

export default defineApiHandler(async (event) => {
  const projectId = event.context.params?.id
  const auth = event.context.auth

  // Check if user has access to this project
  const project = await ProjectModel.findOne({
    _id: projectId,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  })

  if (!project) {
    return apiError(404, 'PROJECT_NOT_FOUND', 'Project not found or you do not have access.')
  }

  const tasks = await TaskModel.find({ project: projectId }).sort({ position: 1 })

  return apiSuccess(tasks)
})
