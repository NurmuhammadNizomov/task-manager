import { UserModel } from '../../modules/auth/models/User'
import { AuthOtpModel } from '../../modules/auth/models/AuthOtp'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { connectDB } from '../../utils/db'
import { tServer } from '../../utils/i18n'
import { hashOtpCode } from '../../modules/auth/utils/otp'
import { readValidatedBody, verifyEmailOtpSchema } from '../../modules/auth/utils/validation'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'

interface VerifyEmailOtpBody {
  email: string
  otp: string
}

const MAX_OTP_ATTEMPTS = 5

export default defineApiHandler(async (event) => {
  const body = await readValidatedBody<VerifyEmailOtpBody>(event, verifyEmailOtpSchema)

  await connectDB(event)

  const user = await UserModel.findOne({ email: body.email })

  if (!user) {
    apiError(400, 'AUTH_OTP_INVALID_OR_EXPIRED', tServer(event, 'errors.otpInvalidOrExpired'))
  }

  if (user.isEmailVerified) {
    return apiSuccess({
      message: tServer(event, 'success.emailAlreadyVerified')
    })
  }

  const otpEntry = await AuthOtpModel.findOne({
    userId: user._id,
    purpose: 'email_verification',
    consumedAt: null,
    expiresAt: { $gt: new Date() }
  })

  if (!otpEntry) {
    apiError(400, 'AUTH_OTP_INVALID_OR_EXPIRED', tServer(event, 'errors.otpInvalidOrExpired'))
  }

  const otpHash = hashOtpCode(body.otp)

  if (otpEntry.codeHash !== otpHash) {
    otpEntry.attempts += 1

    if (otpEntry.attempts >= MAX_OTP_ATTEMPTS) {
      otpEntry.expiresAt = new Date()
    }

    await otpEntry.save()

    apiError(400, 'AUTH_OTP_INVALID_OR_EXPIRED', tServer(event, 'errors.otpInvalidOrExpired'))
  }

  user.isEmailVerified = true
  otpEntry.consumedAt = new Date()

  await Promise.all([
    user.save(),
    otpEntry.save(),
    AuthTokenModel.findOneAndUpdate(
      { userId: user._id },
      {
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    )
  ])

  return apiSuccess({
    message: tServer(event, 'success.emailVerifiedSuccess')
  })
})
