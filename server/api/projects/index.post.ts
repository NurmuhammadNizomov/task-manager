import { z } from 'zod'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'
import { readValidatedBody } from '../../modules/auth/utils/validation'

const projectCreateSchema = z.object({
  name: z.string().min(2).max(100)
})

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const body = await readValidatedBody(event, projectCreateSchema)

  const project = await ProjectModel.create({
    name: body.name,
    owner: auth.userId,
    members: [auth.userId] // The owner is also a member
  })

  return apiSuccess(project)
})
