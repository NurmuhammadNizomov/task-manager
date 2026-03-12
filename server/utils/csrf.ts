import { getCookie, setHeader, getMethod, getHeader, createError, type H3Event } from 'h3'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

export const generateCSRFToken = (): string => {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 32)
}

export const setCSRFCookie = (event: H3Event): string => {
  const token = generateCSRFToken()
  const isSecure = process.env.NODE_ENV === 'production'
  setHeader(event, 'set-cookie', `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; ${isSecure ? 'Secure;' : ''}`)
  return token
}

export const getCSRFCookie = (event: H3Event): string | undefined => {
  return getCookie(event, CSRF_COOKIE_NAME)
}

export const validateCSRFToken = (event: H3Event): boolean => {
  const cookieToken = getCSRFCookie(event)
  const headerToken = getHeader(event, CSRF_HEADER_NAME)
  
  if (!cookieToken || !headerToken) {
    return false
  }
  
  return cookieToken === headerToken
}

export const csrfProtection = (event: H3Event) => {
  const method = getMethod(event)
  
  // Skip CSRF protection for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return
  }
  
  // For state-changing requests, validate CSRF token
  if (!validateCSRFToken(event)) {
    throw createError({
      statusCode: 403,
      message: 'CSRF token validation failed'
    })
  }
}
