import { apiSuccess, apiError, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'
import { TaskModel } from '../../modules/tasks/models/task'

export default defineApiHandler(async (event) => {
  const projectId = event.context.params?.id
  const auth = event.context.auth

  const project = await ProjectModel.findOneAndDelete({ _id: projectId, owner: auth.userId })

  if (!project) {
    return apiError(404, 'PROJECT_NOT_FOUND', 'Project not found or you are not the owner.')
  }

  await TaskModel.deleteMany({ project: projectId })

  return apiSuccess({ message: 'Project deleted successfully.' })
})
