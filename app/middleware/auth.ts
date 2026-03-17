export default defineNuxtRouteMiddleware(async () => {
  const { setAuth, clearAuth } = useAuth()
  const headers = useRequestHeaders(['cookie'])

  try {
    const response = await $fetch('/api/auth/me', {
      headers: import.meta.server ? headers : undefined
    })

    if (response.status === 'success') {
      setAuth(response.data.user)
    } else {
      clearAuth()
      return navigateTo('/login')
    }
  } catch {
    clearAuth()
    return navigateTo('/login')
  }
})
