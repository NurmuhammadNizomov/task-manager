export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, setAuth, clearAuth } = useAuth()

  // Server-side authentication check
  if (import.meta.server) {
    const event = useRequestEvent()
    
    if (!event) {
      clearAuth()
      return navigateTo('/login')
    }
    
    try {
      // Get token from Authorization header or cookie
      const authHeader = getHeader(event, 'authorization') || ''
      const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
      const cookieToken = getCookie(event, 'access_token') || ''
      const token = headerToken || cookieToken

      if (!token) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Authentication required'
        })
      }

      // Verify token directly on server side
      const { verifyAccessToken } = await import('../../server/modules/auth/utils/jwt')
      const payload = verifyAccessToken(token, event)

      if (!payload) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid authentication token'
        })
      }

      // Check session in Redis cache
      const { SessionCacheService } = await import('../../server/modules/auth/utils/session-cache')
      const session = await SessionCacheService.getSession(String(payload.sub))

      if (!session || session.accessToken !== token) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid session'
        })
      }

      // Get user data
      const { UserModel } = await import('../../server/modules/auth/models/User')
      const { connectDB } = await import('../../server/utils/db')
      await connectDB(event)
      
      const user = await UserModel.findById(payload.sub).select('-password')
      if (!user) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found'
        })
      }

      // Set auth state for server-side rendering
      setAuth({
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        language: user.language,
        theme: user.theme,
        isEmailVerified: user.isEmailVerified
      })

      return
    } catch (error) {
      clearAuth()
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
  }

  // Client-side authentication check
  if (import.meta.client) {
    try {
      // Check authentication status by calling the /me endpoint
      const response = await $fetch('/api/auth/me', {
        method: 'GET'
      })
      
      if (response.status === 'success') {
        setAuth(response.data.user)
      } else {
        clearAuth()
        return navigateTo('/login')
      }
    } catch (error) {
      clearAuth()
      return navigateTo('/login')
    }
  }
})
