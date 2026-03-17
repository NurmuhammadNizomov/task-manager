import { apiSuccess, defineApiHandler, apiError } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'

export default defineApiHandler(async (event) => {
  const projectId = event.context.params?.id
  const auth = event.context.auth

  const project = await ProjectModel.findOne({
    _id: projectId,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  }).populate('owner members', 'fullName email')

  if (!project) {
    return apiError(404, 'PROJECT_NOT_FOUND', 'Project not found or you do not have access.')
  }

  return apiSuccess(project)
})
