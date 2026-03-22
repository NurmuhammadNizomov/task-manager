import { UserModel } from '../../modules/auth/models/user'
import { AuthService } from '../../modules/auth/services/auth-service'
import { connectDB } from '../../utils/db'
import { apiError, apiSuccess, defineApiHandler } from '../../utils/api-response'
import { tServer } from '../../utils/i18n'

interface GoogleTokenResponse {
  access_token: string
  token_type: string
  error?: string
  error_description?: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  picture?: string
}

export default defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { code } = body

  if (!code) {
    return apiError(400, 'AUTH_GOOGLE_CODE_REQUIRED', 'Authorization code is required')
  }

  const config = useRuntimeConfig(event)

  // Exchange code for access token (server-side — secret is safe)
  let tokenData: GoogleTokenResponse
  try {
    tokenData = await $fetch<GoogleTokenResponse>('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.public.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.public.googleRedirectUri,
        grant_type: 'authorization_code'
      }).toString()
    })
  } catch {
    return apiError(401, 'AUTH_GOOGLE_TOKEN_FAILED', tServer(event, 'errors.googleInvalidToken'))
  }

  if (tokenData.error || !tokenData.access_token) {
    return apiError(401, 'AUTH_GOOGLE_TOKEN_FAILED', tServer(event, 'errors.googleInvalidToken'))
  }

  // Get user info from Google
  let userInfo: GoogleUserInfo
  try {
    userInfo = await $fetch<GoogleUserInfo>('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
  } catch {
    return apiError(401, 'AUTH_GOOGLE_USERINFO_FAILED', tServer(event, 'errors.googleInvalidToken'))
  }

  if (!userInfo.email) {
    return apiError(401, 'AUTH_GOOGLE_NO_EMAIL', tServer(event, 'errors.googleEmailNotVerified'))
  }

  if (!userInfo.verified_email) {
    return apiError(401, 'AUTH_GOOGLE_EMAIL_NOT_VERIFIED', tServer(event, 'errors.googleEmailNotVerified'))
  }

  await connectDB(event)

  let user = await UserModel.findOne({
    $or: [{ googleId: userInfo.id }, { email: userInfo.email }]
  })

  if (!user) {
    user = await UserModel.create({
      fullName: userInfo.name,
      email: userInfo.email,
      googleId: userInfo.id,
      authType: 'google',
      isEmailVerified: true,
      language: 'en',
      theme: 'light'
    })
  } else if (!user.googleId) {
    user.googleId = userInfo.id
    user.authType = user.authType === 'email' ? 'linked' : user.authType
    user.isEmailVerified = true
    await user.save()
  }

  await AuthService.createSession(event, user)

  return apiSuccess({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      language: user.language,
      theme: user.theme
    }
  })
})
