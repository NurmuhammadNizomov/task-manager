import { z } from 'zod'
import { apiSuccess, defineApiHandler, apiError } from '../../../utils/api-response'
import { ProjectModel } from '../../../modules/projects/models/project'
import { readValidatedBody } from '../../../modules/auth/utils/validation'

const removeMemberSchema = z.object({
  memberId: z.string()
})

export default defineApiHandler(async (event) => {
  const projectId = event.context.params?.id
  const auth = event.context.auth
  const body = await readValidatedBody(event, removeMemberSchema)

  const project = await ProjectModel.findById(projectId).select('owner').lean()

  if (!project) {
    return apiError(404, 'PROJECT_NOT_FOUND', 'Project not found.')
  }

  if (project.owner.toString() !== auth.userId) {
    return apiError(403, 'FORBIDDEN', 'Only the project owner can remove members.')
  }

  if (body.memberId === project.owner.toString()) {
    return apiError(400, 'CANNOT_REMOVE_OWNER', 'The project owner cannot be removed.')
  }

  await ProjectModel.findByIdAndUpdate(projectId, {
    $pull: { members: body.memberId }
  })

  return apiSuccess({ message: 'Member removed successfully.' })
})
