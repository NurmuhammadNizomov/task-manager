import { readMultipartFormData, createError } from 'h3'
import { apiSuccess, apiError, defineApiHandler } from '../../utils/api-response'
import { UserModel } from '../../modules/auth/models/user'
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const multipart = await readMultipartFormData(event)
  const file = multipart?.[0]

  if (!file || !file.data || !file.filename) {
    return apiError(400, 'FILE_REQUIRED', 'No file provided for upload.')
  }

  const user = await UserModel.findById(auth.userId)
  if (!user) {
    return apiError(404, 'USER_NOT_FOUND', 'User not found.')
  }

  // Delete old avatar if it exists
  if (user.avatar?.publicId) {
    try {
      await deleteFromCloudinary(user.avatar.publicId)
    } catch (e) {
      console.error('Failed to delete old avatar:', e)
      // Continue even if deletion fails
    }
  }

  // Upload new avatar
  try {
    const uploadResult = await uploadToCloudinary(event, file, 'user-avatars')
    
    user.avatar = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url
    }
    
    await user.save()

    return apiSuccess({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    })
  } catch (error) {
    console.error('Avatar upload failed:', error)
    return apiError(500, 'UPLOAD_FAILED', 'Failed to upload avatar.')
  }
})
