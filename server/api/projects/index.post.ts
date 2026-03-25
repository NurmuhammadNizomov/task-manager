import { z } from 'zod'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'
import { readValidatedBody } from '../../modules/auth/utils/validation'

const projectCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional()
})

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const body = await readValidatedBody(event, projectCreateSchema)

  const created = await ProjectModel.create({
    name: body.name,
    description: body.description,
    owner: auth.userId,
    members: [auth.userId]
  })

  const project = await ProjectModel.findById(created._id).populate('owner', 'fullName email')

  return apiSuccess(project)
})
