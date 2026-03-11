import { UserModel } from '../../modules/auth/models/User'
import { AuthOtpModel } from '../../modules/auth/models/AuthOtp'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { createOtpCode, hashOtpCode } from '../../modules/auth/utils/otp'
import { enforceRateLimit } from '../../modules/auth/utils/rate-limit'
import { sendPasswordResetEmail } from '../../modules/auth/utils/resend'
import { createRawToken, hashToken } from '../../modules/auth/utils/token'
import { forgotPasswordSchema, readValidatedBody } from '../../modules/auth/utils/validation'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'

interface ForgotPasswordBody {
  email: string
}

const PASSWORD_RESET_TOKEN_LIFETIME_MS = 1000 * 60 * 15
const PASSWORD_RESET_OTP_LIFETIME_MS = 1000 * 60 * 10

export default defineApiHandler(async (event) => {
  await enforceRateLimit(event, 'forgotPassword')
  const body = await readValidatedBody<ForgotPasswordBody>(event, forgotPasswordSchema)

  await connectDB(event)

  const user = await UserModel.findOne({ email: body.email })

  if (user) {
    const rawToken = createRawToken()
    const tokenHash = hashToken(rawToken)
    const otpCode = createOtpCode()
    const otpHash = hashOtpCode(otpCode)

    await Promise.all([
      AuthTokenModel.findOneAndUpdate(
        { userId: user._id },
        {
          passwordResetToken: tokenHash,
          passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_TOKEN_LIFETIME_MS)
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      ),
      AuthOtpModel.findOneAndUpdate(
        { userId: user._id, purpose: 'password_reset' },
        {
          codeHash: otpHash,
          expiresAt: new Date(Date.now() + PASSWORD_RESET_OTP_LIFETIME_MS),
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

    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.fullName,
      token: rawToken,
      otpCode
    })
  }

  return apiSuccess({
    message: tServer(event, 'success.forgotPasswordSent')
  })
})
