import nodemailer from 'nodemailer'

type BaseMailPayload = {
  to: string
  fullName: string
}

const emailWrapper = (title: string, previewText: string, body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${previewText}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.5px;">Task Manager</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;padding:40px 40px 32px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

const verifyEmailBody = (fullName: string, verifyUrl: string) => `
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Verify your email</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
    Hi <strong style="color:#111827;">${fullName}</strong>, welcome to Task Manager!<br/>
    Click the button below to confirm your email address and activate your account.
  </p>

  <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
    <tr>
      <td style="border-radius:8px;background-color:#4f46e5;">
        <a href="${verifyUrl}"
          style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">
          Verify email address
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">Or copy this link into your browser:</p>
  <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;">
    <a href="${verifyUrl}" style="color:#4f46e5;text-decoration:none;">${verifyUrl}</a>
  </p>

  <hr style="margin:32px 0;border:none;border-top:1px solid #f3f4f6;" />

  <p style="margin:0;font-size:13px;color:#9ca3af;">
    This link expires in <strong>24 hours</strong>.
  </p>
`

const resetPasswordBody = (fullName: string, resetUrl: string) => `
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Reset your password</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
    Hi <strong style="color:#111827;">${fullName}</strong>,<br/>
    We received a request to reset your password. Click the button below to choose a new one.
  </p>

  <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
    <tr>
      <td style="border-radius:8px;background-color:#4f46e5;">
        <a href="${resetUrl}"
          style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">
          Reset password
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">Or copy this link into your browser:</p>
  <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;">
    <a href="${resetUrl}" style="color:#4f46e5;text-decoration:none;">${resetUrl}</a>
  </p>

  <hr style="margin:32px 0;border:none;border-top:1px solid #f3f4f6;" />

  <p style="margin:0;font-size:13px;color:#9ca3af;">
    This link expires in <strong>15 minutes</strong>. If you didn't request a password reset, ignore this email.
  </p>
`

const createTransporter = () => {
  const config = useRuntimeConfig()
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: false,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  })
}

export const sendVerificationEmail = async (
  payload: BaseMailPayload & { token: string }
) => {
  const config = useRuntimeConfig()

  if (!config.smtpUser || !config.smtpPass) {
    console.warn('[Mailer] Not configured — skipping email send')
    return { sent: false, reason: 'mailer_not_configured' as const }
  }

  const verifyUrl = `${config.public.appBaseUrl}/verify-email?token=${payload.token}`

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: config.smtpFrom || config.smtpUser,
      to: payload.to,
      subject: 'Verify your email address',
      html: emailWrapper(
        'Verify your email address',
        'Click the button to verify your Task Manager account.',
        verifyEmailBody(payload.fullName, verifyUrl)
      )
    })
    return { sent: true as const }
  } catch (error) {
    console.error('[Mailer] Failed to send verification email:', error)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Mailer] DEV fallback — verify manually:', verifyUrl)
    }
    return { sent: false, reason: 'mailer_error' as const }
  }
}

export const sendPasswordResetEmail = async (
  payload: BaseMailPayload & { token: string }
) => {
  const config = useRuntimeConfig()

  if (!config.smtpUser || !config.smtpPass) {
    console.warn('[Mailer] Not configured — skipping email send')
    return { sent: false, reason: 'mailer_not_configured' as const }
  }

  const resetUrl = `${config.public.appBaseUrl}/reset-password?token=${payload.token}`

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: config.smtpFrom || config.smtpUser,
      to: payload.to,
      subject: 'Reset your password',
      html: emailWrapper(
        'Reset your password',
        'Click the button to reset your Task Manager password.',
        resetPasswordBody(payload.fullName, resetUrl)
      )
    })
    return { sent: true as const }
  } catch (error) {
    console.error('[Mailer] Failed to send password reset email:', error)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Mailer] DEV fallback — reset manually:', resetUrl)
    }
    return { sent: false, reason: 'mailer_error' as const }
  }
}
