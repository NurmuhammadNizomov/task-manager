import { apiSuccess, defineApiHandler, apiError } from '../../../utils/api-response'
import { TaskModel } from '../../../modules/tasks/models/task'
import { ProjectModel } from '../../../modules/projects/models/project'

export default defineApiHandler(async (event) => {
  const projectId = event.context.params?.id
  const auth = event.context.auth
  const query = getQuery(event)

  const project = await ProjectModel.findOne({
    _id: projectId,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  })

  if (!project) {
    return apiError(404, 'PROJECT_NOT_FOUND', 'Project not found or you do not have access.')
  }

  const filter: Record<string, unknown> = { project: projectId }

  if (query.search) {
    filter.$or = [
      { title: { $regex: String(query.search), $options: 'i' } },
      { description: { $regex: String(query.search), $options: 'i' } }
    ]
  }

  if (query.priority) filter.priority = query.priority
  if (query.status) filter.status = query.status

  const tasks = await TaskModel.find(filter).sort({ status: 1, position: 1 })

  return apiSuccess(tasks)
})
