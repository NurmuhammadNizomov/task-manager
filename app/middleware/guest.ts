export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const { accessToken, initFromStorage } = useAuth()
  initFromStorage()

  if (accessToken.value) {
    return navigateTo('/dashboard')
  }
})
