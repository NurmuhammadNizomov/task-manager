import { UserModel } from '../../modules/auth/models/User'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { setRefreshTokenCookie } from '../../modules/auth/utils/cookies'
import { signAccessToken, signRefreshToken } from '../../modules/auth/utils/jwt'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { loginSchema, readValidatedBody } from '../../modules/auth/utils/validation'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'

interface LoginBody {
  email: string
  password: string
}

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'login')
  const body = await readValidatedBody<LoginBody>(event, loginSchema)

  await connectDB(event)

  const user = await UserModel.findOne({ email: body.email })

  if (!user) {
    apiError(401, 'AUTH_INVALID_CREDENTIALS', tServer(event, 'errors.invalidCredentials'))
  }

  const isPasswordCorrect = await user.comparePassword(body.password)

  if (!isPasswordCorrect) {
    apiError(401, 'AUTH_INVALID_CREDENTIALS', tServer(event, 'errors.invalidCredentials'))
  }

  if (!user.isEmailVerified) {
    apiError(403, 'AUTH_EMAIL_NOT_VERIFIED', tServer(event, 'errors.emailNotVerified'))
  }

  const accessToken = signAccessToken(String(user._id), user.email, event)
  const refreshToken = signRefreshToken(String(user._id), user.email, event)

  await AuthSessionModel.findOneAndUpdate(
    { userId: user._id },
    { accessToken, refreshToken },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  setRefreshTokenCookie(event, refreshToken)

  return apiSuccess({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      language: user.language,
      theme: user.theme
    }
  })
})
