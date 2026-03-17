import { readMultipartFormData, createError } from 'h3'
import { apiSuccess, apiError, defineApiHandler } from '../../../utils/api-response'
import { TaskModel } from '../../../modules/tasks/models/task'
import { ProjectModel } from '../../../modules/projects/models/project'
import { uploadToCloudinary } from '../../../utils/cloudinary'

export default defineApiHandler(async (event) => {
  const taskId = event.context.params?.id
  const auth = event.context.auth

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

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    return apiError(400, 'NO_FILES_UPLOADED', 'No files were uploaded.')
  }

  const uploadedFiles = []

  for (const file of formData) {
    if (file.name === 'file' && file.data) {
      try {
        const result = (await uploadToCloudinary(file.data, 'task-manager')) as any
        
        const attachment = {
          publicId: result.public_id,
          url: result.secure_url,
          filename: file.filename || 'unnamed-file',
          mimeType: file.type || 'application/octet-stream',
          size: file.data.length
        }
        
        task.attachments.push(attachment)
        uploadedFiles.push(attachment)
      } catch (error) {
        console.error('[Upload] Cloudinary upload failed:', error)
        return apiError(500, 'UPLOAD_FAILED', 'Failed to upload file to Cloudinary.')
      }
    }
  }

  await task.save()

  return apiSuccess({
    message: 'Files uploaded successfully',
    attachments: uploadedFiles
  })
})
