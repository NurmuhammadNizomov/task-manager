import { z } from 'zod'
import { apiSuccess, apiError, defineApiHandler } from '../../../utils/api-response'
import { TaskModel } from '../../../modules/tasks/models/task'
import { ProjectModel } from '../../../modules/projects/models/project'
import { deleteFromCloudinary } from '../../../utils/cloudinary'
import { readValidatedBody } from '../../../modules/auth/utils/validation'

const removeAttachmentSchema = z.object({
  publicId: z.string()
})

export default defineApiHandler(async (event) => {
  const taskId = event.context.params?.id
  const auth = event.context.auth
  const body = await readValidatedBody(event, removeAttachmentSchema)

  if (!taskId) {
    return apiError(400, 'TASK_ID_REQUIRED', 'Task ID is required.')
  }

  const task = await TaskModel.findById(taskId)
  if (!task) {
    return apiError(404, 'TASK_NOT_FOUND', 'Task not found.')
  }

  // Check project access
  const project = await ProjectModel.findOne({
    _id: task.project,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  })

  if (!project) {
    return apiError(403, 'FORBIDDEN', 'You do not have access to this project.')
  }

  const attachment = task.attachments.find(a => a.publicId === body.publicId)
  if (!attachment) {
    return apiError(404, 'ATTACHMENT_NOT_FOUND', 'Attachment not found on this task.')
  }

  try {
    await deleteFromCloudinary(body.publicId)
    
    task.attachments = task.attachments.filter(a => a.publicId !== body.publicId)
    await task.save()
    
    return apiSuccess({ message: 'Attachment deleted successfully' })
  } catch (error) {
    console.error('[Delete] Cloudinary deletion failed:', error)
    return apiError(500, 'DELETE_FAILED', 'Failed to delete file from Cloudinary.')
  }
})
