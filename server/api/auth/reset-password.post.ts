import { createError, deleteCookie } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { hashToken } from '../../modules/auth/utils/token'
import { readValidatedBody, resetPasswordSchema } from '../../modules/auth/utils/validation'

type ResetPasswordBody = {
  token: string
  password: string
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody<ResetPasswordBody>(event, resetPasswordSchema)

  await connectDB()

  const tokenHash = hashToken(body.token)

  const securityToken = await AuthTokenModel.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() }
  })

  if (!securityToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Reset token is invalid or expired'
    })
  }

  const user = await UserModel.findById(securityToken.userId)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  user.password = body.password
  await user.save()

  securityToken.passwordResetToken = null
  securityToken.passwordResetExpires = null
  await securityToken.save()

  await AuthSessionModel.findOneAndUpdate(
    { userId: user._id },
    { accessToken: null, refreshToken: null }
  )

  deleteCookie(event, 'refresh_token', { path: '/' })

  return {
    success: true,
    message: 'Password reset successful. Please login again.'
  }
})



