import { getQuery, sendRedirect } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { hashToken } from '../../modules/auth/utils/token'
import { apiError } from '../../utils/api-response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = String(query.token || '')

  if (!token) {
    apiError(
      400,
      'AUTH_VERIFICATION_TOKEN_REQUIRED',
      tServer(event, 'errors.verificationTokenRequired')
    )
  }

  await connectDB(event)

  const securityToken = await AuthTokenModel.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() }
  })

  if (!securityToken) {
    apiError(
      400,
      'AUTH_VERIFICATION_TOKEN_INVALID_OR_EXPIRED',
      tServer(event, 'errors.verificationTokenInvalidOrExpired')
    )
  }

  const user = await UserModel.findById(securityToken.userId)

  if (!user) {
    apiError(404, 'USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
  }

  user.isEmailVerified = true
  await user.save()

  securityToken.emailVerificationToken = null
  securityToken.emailVerificationExpires = null
  await securityToken.save()

  return sendRedirect(event, '/login?verified=1')
})



