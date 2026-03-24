import { apiSuccess, defineApiHandler, apiError } from '../../utils/api-response'
import { TaskModel } from '../../modules/tasks/models/task'
import { ProjectModel } from '../../modules/projects/models/project'

export default defineApiHandler(async (event) => {
  const taskId = event.context.params?.id
  const auth = event.context.auth

  const task = await TaskModel.findById(taskId)
  if (!task) return apiError(404, 'TASK_NOT_FOUND', 'Task not found.')

  const project = await ProjectModel.findOne({
    _id: task.project,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  })
  if (!project) return apiError(403, 'FORBIDDEN', 'You do not have access to this project.')

  // Shift positions of tasks after this one
  await TaskModel.updateMany(
    { project: task.project, status: task.status, position: { $gt: task.position } },
    { $inc: { position: -1 } }
  )

  await task.deleteOne()
  return apiSuccess({ deleted: true })
})
