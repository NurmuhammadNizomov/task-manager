export default defineNuxtPlugin(() => {
  const getCSRFToken = (): string | undefined => {
    const cookies = document.cookie.split(';')
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrf_token='))
    return csrfCookie?.split('=')[1]
  }

  // Add CSRF token to all fetch requests
  if (import.meta.client) {
    const originalFetch = globalThis.fetch
    
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      
      // Only add CSRF token to API requests with state-changing methods
      if (url.startsWith('/api/') && init && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method?.toUpperCase() || '')) {
        const csrfToken = getCSRFToken()
        if (csrfToken) {
          init.headers = {
            ...init.headers,
            'x-csrf-token': csrfToken
          }
        }
      }
      
      return originalFetch(input, init)
    }
  }
})
