import { UserModel } from '../../modules/auth/models/User'
import { AuthOtpModel } from '../../modules/auth/models/AuthOtp'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { createOtpCode, hashOtpCode } from '../../modules/auth/utils/otp'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { sendVerificationEmail } from '../../modules/auth/utils/resend'
import { createRawToken, hashToken } from '../../modules/auth/utils/token'
import { readValidatedBody, registerSchema } from '../../modules/auth/utils/validation'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'

interface RegisterBody {
  fullName: string
  email: string
  password: string
  language?: 'en' | 'ru' | 'uz'
  theme?: 'light' | 'dark' | 'system'
}

const EMAIL_VERIFY_TOKEN_LIFETIME_MS = 1000 * 60 * 60 * 24
const EMAIL_VERIFY_OTP_LIFETIME_MS = 1000 * 60 * 10

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'register')
  const body = await readValidatedBody<RegisterBody>(event, registerSchema)

  await connectDB(event)

  const existingUser = await UserModel.findOne({ email: body.email }).lean()

  if (existingUser) {
    apiError(409, 'AUTH_USER_ALREADY_EXISTS', tServer(event, 'errors.userAlreadyExists'))
  }

  const verificationTokenRaw = createRawToken()
  const verificationTokenHash = hashToken(verificationTokenRaw)
  const verificationOtpCode = createOtpCode()
  const verificationOtpHash = hashOtpCode(verificationOtpCode)

  const user = await UserModel.create({
    fullName: body.fullName,
    email: body.email,
    password: body.password,
    isEmailVerified: false,
    language: body.language ?? 'en',
    theme: body.theme ?? 'light'
  })

  await Promise.all([
    AuthTokenModel.findOneAndUpdate(
      { userId: user._id },
      {
        emailVerificationToken: verificationTokenHash,
        emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFY_TOKEN_LIFETIME_MS),
        passwordResetToken: null,
        passwordResetExpires: null
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ),
    AuthOtpModel.findOneAndUpdate(
      { userId: user._id, purpose: 'email_verification' },
      {
        codeHash: verificationOtpHash,
        expiresAt: new Date(Date.now() + EMAIL_VERIFY_OTP_LIFETIME_MS),
        attempts: 0,
        consumedAt: null
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    )
  ])

  const mailResult = await sendVerificationEmail({
    to: user.email,
    fullName: user.fullName,
    token: verificationTokenRaw,
    otpCode: verificationOtpCode
  })

  return apiSuccess({
    message: mailResult.sent
      ? tServer(event, 'success.registerVerifyWithEmail')
      : tServer(event, 'success.registerVerifyResendNotConfigured'),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      language: user.language,
      theme: user.theme
    }
  })
})
