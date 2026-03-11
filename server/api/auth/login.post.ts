import { createError } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { setRefreshTokenCookie } from '../../modules/auth/utils/cookies'
import { signAccessToken, signRefreshToken } from '../../modules/auth/utils/jwt'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { loginSchema, readValidatedBody } from '../../modules/auth/utils/validation'

type LoginBody = {
  email: string
  password: string
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'login')
  const body = await readValidatedBody<LoginBody>(event, loginSchema)

  await connectDB()

  const user = await UserModel.findOne({ email: body.email })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password'
    })
  }

  const isPasswordCorrect = await user.comparePassword(body.password)

  if (!isPasswordCorrect) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password'
    })
  }

  if (!user.isEmailVerified) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Please verify your email first'
    })
  }

  const accessToken = signAccessToken(String(user._id), user.email)
  const refreshToken = signRefreshToken(String(user._id), user.email)

  await AuthSessionModel.findOneAndUpdate(
    { userId: user._id },
    { accessToken, refreshToken },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  setRefreshTokenCookie(event, refreshToken)

  return {
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      language: user.language,
      theme: user.theme
    }
  }
})




