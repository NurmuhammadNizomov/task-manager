import { deleteCookie } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { hashToken } from '../../modules/auth/utils/token'
import { readValidatedBody, resetPasswordSchema } from '../../modules/auth/utils/validation'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'

interface ResetPasswordBody {
  token: string
  password: string
}

export default defineApiHandler(async (event) => {
  const body = await readValidatedBody<ResetPasswordBody>(event, resetPasswordSchema)

  await connectDB(event)

  const tokenHash = hashToken(body.token)

  const securityToken = await AuthTokenModel.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() }
  })

  if (!securityToken) {
    apiError(
      400,
      'AUTH_RESET_TOKEN_INVALID_OR_EXPIRED',
      tServer(event, 'errors.resetTokenInvalidOrExpired')
    )
  }

  const user = await UserModel.findById(securityToken.userId)

  if (!user) {
    apiError(404, 'USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
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

  return apiSuccess({
    message: tServer(event, 'success.passwordResetSuccess')
  })
})
