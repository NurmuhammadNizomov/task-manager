import { createError, getQuery, sendRedirect } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { connectDB } from '../../utils/db'
import { hashToken } from '../../modules/auth/utils/token'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = String(query.token || '')

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification token is required'
    })
  }

  await connectDB()

  const securityToken = await AuthTokenModel.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() }
  })

  if (!securityToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification token is invalid or expired'
    })
  }

  const user = await UserModel.findById(securityToken.userId)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  user.isEmailVerified = true
  await user.save()

  securityToken.emailVerificationToken = null
  securityToken.emailVerificationExpires = null
  await securityToken.save()

  return sendRedirect(event, '/login?verified=1')
})



