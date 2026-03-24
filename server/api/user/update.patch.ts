import { z } from 'zod'
import { apiSuccess, apiError, defineApiHandler } from '../../utils/api-response'
import { UserModel } from '../../modules/auth/models/user'
import { readValidatedBody } from '../../modules/auth/utils/validation'
import { createSanitizedSchemas } from '../../utils/sanitization'

const sanitizedSchemas = createSanitizedSchemas()

const updateUserSchema = z.object({
  fullName: sanitizedSchemas.fullName.optional(),
  bio: z.string().max(500).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128).optional()
}).refine(data => {
  // If newPassword is provided, currentPassword must also be provided
  return !(data.newPassword && !data.currentPassword)
}, {
  message: 'Current password is required to set a new password',
  path: ['currentPassword']
})

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const body = await readValidatedBody(event, updateUserSchema)

  const user = await UserModel.findById(auth.userId).select('+password')
  if (!user) {
    return apiError(404, 'USER_NOT_FOUND', 'User not found.')
  }

  let updated = false

  if (body.fullName && body.fullName !== user.fullName) {
    user.fullName = body.fullName
    updated = true
  }

  if (typeof body.bio !== 'undefined' && body.bio !== user.bio) {
    user.bio = body.bio
    updated = true
  }

  // Update password if provided
  if (body.newPassword && body.currentPassword) {
    const isMatch = await user.comparePassword(body.currentPassword)
    if (!isMatch) {
      return apiError(400, 'INVALID_PASSWORD', 'The current password you entered is incorrect.')
    }
    user.password = body.newPassword
    updated = true
  }

  if (updated) {
    await user.save()
  }

  // Return a fresh user object without the password
  const updatedUser = await UserModel.findById(auth.userId)

  return apiSuccess({
    message: 'Profile updated successfully',
    user: updatedUser
  })
})
