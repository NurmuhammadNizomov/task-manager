import { z } from 'zod'
import { apiSuccess, apiError, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'
import { readValidatedBody } from '../../modules/auth/utils/validation'

const projectUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'archived', 'completed']).optional()
}).refine(data => data.name !== undefined || data.description !== undefined || data.status !== undefined, {
  message: 'Provide at least one field to update'
})

export default defineApiHandler(async (event) => {
  const projectId = event.context.params?.id
  const auth = event.context.auth
  const body = await readValidatedBody(event, projectUpdateSchema)

  const project = await ProjectModel.findOneAndUpdate(
    { _id: projectId, owner: auth.userId },
    { $set: body },
    { returnDocument: 'after' }
  ).populate('owner members', 'fullName email')

  if (!project) {
    return apiError(404, 'PROJECT_NOT_FOUND', 'Project not found or you are not the owner.')
  }

  return apiSuccess(project)
})
