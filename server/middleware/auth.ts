import { getHeader, getCookie, createError, getMethod } from 'h3'

// Public routes that do NOT require authentication
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/refresh',
  '/api/auth/google-callback',
  '/api/auth/google',
]

export default defineEventHandler(async (event) => {
  const path = event.path || ''

  // Only apply to API routes
  if (!path.startsWith('/api/')) return

  // Skip Nuxt internal API routes (icons, etc.)
  if (path.startsWith('/api/_nuxt_icon/') || path.startsWith('/api/_')) return

  // Skip OPTIONS (CORS preflight)
  if (getMethod(event) === 'OPTIONS') return

  // Skip public auth endpoints
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) return

  // Get token from cookie or Authorization header
  const authHeader = getHeader(event, 'authorization') || ''
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const cookieToken = getCookie(event, 'access_token') || ''
  const token = headerToken || cookieToken

  if (!token) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }

  const { verifyAccessToken } = await import('../modules/auth/utils/jwt')
  const payload = verifyAccessToken(token, event)

  if (!payload) {
    throw createError({ statusCode: 401, message: 'Invalid authentication token' })
  }

  const { SessionCacheService } = await import('../modules/auth/utils/session-cache')
  const session = await SessionCacheService.getSession(String(payload.sub))

  if (!session || session.accessToken !== token) {
    throw createError({ statusCode: 401, message: 'Invalid session' })
  }

  event.context.auth = {
    userId: payload.sub,
    email: payload.email,
    payload
  }
})
