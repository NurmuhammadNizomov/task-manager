import { getHeader, getCookie, createError, getMethod } from 'h3'

export default defineEventHandler(async (event) => {
  const path = event.path || ''

  // Only apply to API routes that require authentication
  if (!path.startsWith('/api/auth/') || 
      path.includes('/login') || 
      path.includes('/register') ||
      path.includes('/forgot-password') ||
      path.includes('/reset-password') ||
      path.includes('/verify-email')) {
    return
  }

  // Skip for OPTIONS requests (CORS preflight)
  if (getMethod(event) === 'OPTIONS') {
    return
  }

  // Get token from Authorization header first, then from cookie
  const authHeader = getHeader(event, 'authorization') || ''
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const cookieToken = getCookie(event, 'access_token') || ''
  const token = headerToken || cookieToken

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  // Verify token
  const { verifyAccessToken } = await import('../modules/auth/utils/jwt')
  const payload = verifyAccessToken(token, event)

  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid authentication token'
    })
  }

  // Check session in MongoDB
  const { SessionCacheService } = await import('../modules/auth/utils/session-cache')
  const session = await SessionCacheService.getSession(String(payload.sub))

  if (!session || session.accessToken !== token) {
    throw createError({
      statusCode: 401,
      message: 'Invalid session'
    })
  }

  // Attach user info to event context for use in API handlers
  event.context.auth = {
    userId: payload.sub,
    email: payload.email,
    payload
  }
})
