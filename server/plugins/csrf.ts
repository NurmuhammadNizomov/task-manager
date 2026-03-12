import { setCSRFCookie, csrfProtection } from '../utils/csrf'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    // Only apply to API routes
    if (!event.node.req.url?.startsWith('/api/')) {
      return
    }

    // Set CSRF token for all requests
    setCSRFCookie(event)

    // Apply CSRF protection for state-changing methods
    csrfProtection(event)
  })
})
