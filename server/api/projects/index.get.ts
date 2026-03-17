import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth

  const projects = await ProjectModel.find({
    $or: [{ owner: auth.userId }, { members: auth.userId }],
    isArchived: false
  })
    .populate('owner', 'fullName email')
    .sort({ createdAt: -1 })

  return apiSuccess(projects)
})
