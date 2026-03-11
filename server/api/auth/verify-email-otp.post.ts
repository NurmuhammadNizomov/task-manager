import { createError } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthOtpModel } from '../../modules/auth/models/AuthOtp'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { connectDB } from '../../utils/db'
import { hashOtpCode } from '../../modules/auth/utils/otp'
import { readValidatedBody, verifyEmailOtpSchema } from '../../modules/auth/utils/validation'

type VerifyEmailOtpBody = {
  email: string
  otp: string
}

const MAX_OTP_ATTEMPTS = 5

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody<VerifyEmailOtpBody>(event, verifyEmailOtpSchema)

  await connectDB()

  const user = await UserModel.findOne({ email: body.email })

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'OTP code is invalid or expired'
    })
  }

  if (user.isEmailVerified) {
    return {
      success: true,
      message: 'Email already verified.'
    }
  }

  const otpEntry = await AuthOtpModel.findOne({
    userId: user._id,
    purpose: 'email_verification',
    consumedAt: null,
    expiresAt: { $gt: new Date() }
  })

  if (!otpEntry) {
    throw createError({
      statusCode: 400,
      statusMessage: 'OTP code is invalid or expired'
    })
  }

  const otpHash = hashOtpCode(body.otp)

  if (otpEntry.codeHash !== otpHash) {
    otpEntry.attempts += 1

    if (otpEntry.attempts >= MAX_OTP_ATTEMPTS) {
      otpEntry.expiresAt = new Date()
    }

    await otpEntry.save()

    throw createError({
      statusCode: 400,
      statusMessage: 'OTP code is invalid or expired'
    })
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

  return {
    success: true,
    message: 'Email verified successfully.'
  }
})



