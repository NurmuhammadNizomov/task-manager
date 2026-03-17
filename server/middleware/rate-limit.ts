import { enforceRateLimit } from '../modules/auth/utils/rate-limit'

export default defineEventHandler(async (event) => {
  // Apply global rate limit to all API routes
  if (event.node.req.url?.startsWith('/api/')) {
    // Skip rate limit for internal Nuxt calls if any, or specific paths
    // but generally /api/ should be protected
    await enforceRateLimit(event, 'global')
  }
})
