import { Resend } from 'resend'

type BaseMailPayload = {
  to: string
  fullName: string
}

export const sendVerificationEmail = async (
  payload: BaseMailPayload & { token: string; otpCode?: string }
) => {
  const config = useRuntimeConfig()

  if (!config.resendApiKey || !config.resendFromEmail) {
    return { sent: false, reason: 'resend_not_configured' as const }
  }

  const resend = new Resend(config.resendApiKey)
  const verifyUrl = `${config.public.appBaseUrl}/api/auth/verify-email?token=${payload.token}`
  const otpBlock = payload.otpCode
    ? `<p>Your OTP code: <strong>${payload.otpCode}</strong> (valid for 10 minutes)</p>`
    : ''

  await resend.emails.send({
    from: config.resendFromEmail,
    to: payload.to,
    subject: 'Verify your email',
    html: `<p>Hi ${payload.fullName},</p><p>Please verify your account:</p>${otpBlock}<p><a href="${verifyUrl}">${verifyUrl}</a></p>`
  })

  return { sent: true as const }
}

export const sendPasswordResetEmail = async (
  payload: BaseMailPayload & { token: string; otpCode?: string }
) => {
  const config = useRuntimeConfig()

  if (!config.resendApiKey || !config.resendFromEmail) {
    return { sent: false, reason: 'resend_not_configured' as const }
  }

  const resend = new Resend(config.resendApiKey)
  const resetUrl = `${config.public.appBaseUrl}/reset-password?token=${payload.token}`
  const otpBlock = payload.otpCode
    ? `<p>Your OTP code: <strong>${payload.otpCode}</strong> (valid for 10 minutes)</p>`
    : ''

  await resend.emails.send({
    from: config.resendFromEmail,
    to: payload.to,
    subject: 'Reset your password',
    html: `<p>Hi ${payload.fullName},</p><p>Reset your password using one of these methods:</p>${otpBlock}<p><a href="${resetUrl}">${resetUrl}</a></p>`
  })

  return { sent: true as const }
}


