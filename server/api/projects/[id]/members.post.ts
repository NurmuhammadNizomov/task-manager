import { z } from 'zod'
import { apiSuccess, defineApiHandler, apiError } from '../../../utils/api-response'
import { ProjectModel } from '../../../modules/projects/models/project'
import { UserModel } from '../../../modules/auth/models/user'
import { readValidatedBody } from '../../../modules/auth/utils/validation'
import { NotificationService } from '../../../modules/notifications/services/notification-service'

const addMemberSchema = z.object({
  email: z.string().email()
})

export default defineApiHandler(async (event) => {
  const projectId = event.context.params?.id
  const auth = event.context.auth
  const body = await readValidatedBody(event, addMemberSchema)

  const project = await ProjectModel.findById(projectId)

  if (!project) {
    return apiError(404, 'PROJECT_NOT_FOUND', 'Project not found.')
  }

  // Only the project owner can add members
  if (project.owner.toString() !== auth.userId) {
    return apiError(403, 'FORBIDDEN', 'Only the project owner can add members.')
  }

  const userToAdd = await UserModel.findOne({ email: body.email })

  if (!userToAdd) {
    return apiError(404, 'USER_NOT_FOUND', 'User with this email not found.')
  }

  if (project.members.includes(userToAdd._id)) {
    return apiError(409, 'MEMBER_ALREADY_EXISTS', 'This user is already a member of the project.')
  }

  project.members.push(userToAdd._id)
  await project.save()

  // Send notification to the new member
  await NotificationService.createNotification({
    recipient: userToAdd._id,
    sender: auth.userId,
    type: 'project_invitation',
    title: 'Added to project',
    message: `You have been added to project: ${project.name}`,
    link: `/projects/${project._id}`
  })

  return apiSuccess({ message: 'Member added successfully.' })
})
