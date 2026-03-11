import { createError, deleteCookie } from 'h3'
import { UserModel } from '../../modules/auth/models/User'
import { AuthOtpModel } from '../../modules/auth/models/AuthOtp'
import { AuthTokenModel } from '../../modules/auth/models/AuthToken'
import { AuthSessionModel } from '../../modules/auth/models/AuthSession'
import { connectDB } from '../../utils/db'
import { hashOtpCode } from '../../modules/auth/utils/otp'
import { readValidatedBody, resetPasswordOtpSchema } from '../../modules/auth/utils/validation'

type ResetPasswordOtpBody = {
  email: string
  otp: string
  password: string
}

const MAX_OTP_ATTEMPTS = 5

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody<ResetPasswordOtpBody>(event, resetPasswordOtpSchema)

  await connectDB()

  const user = await UserModel.findOne({ email: body.email })

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'OTP code is invalid or expired'
    })
  }

  const otpEntry = await AuthOtpModel.findOne({
    userId: user._id,
    purpose: 'password_reset',
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

  user.password = body.password
  otpEntry.consumedAt = new Date()

  await Promise.all([
    user.save(),
    otpEntry.save(),
    AuthTokenModel.findOneAndUpdate(
      { userId: user._id },
      {
        passwordResetToken: null,
        passwordResetExpires: null
      }
    ),
    AuthSessionModel.findOneAndUpdate(
      { userId: user._id },
      { accessToken: null, refreshToken: null }
    )
  ])

  deleteCookie(event, 'refresh_token', { path: '/' })

  return {
    success: true,
    message: 'Password reset successful. Please login again.'
  }
})



