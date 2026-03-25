import { z } from 'zod'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'
import { readValidatedBody } from '../../modules/auth/utils/validation'

const reorderSchema = z.object({
  ids: z.array(z.string()).min(1)
})

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const { ids } = await readValidatedBody(event, reorderSchema)

  await Promise.all(
    ids.map((id, index) =>
      ProjectModel.updateOne(
        { _id: id, $or: [{ owner: auth.userId }, { members: auth.userId }] },
        { $set: { sortOrder: index } }
      )
    )
  )

  return apiSuccess({ message: 'Order saved.' })
})
