interface NuxtError {
  statusCode?: number
  response?: { status: number }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (error: NuxtError) => {
    if (error?.statusCode === 404) return

    const toast = useToast()

    if (error?.statusCode === 429) {
      toast.add({
        title: 'Too many requests',
        description: 'Please slow down and try again in a moment.',
        color: 'warning',
        duration: 6000
      })
    } else if (error?.statusCode === 503) {
      toast.add({
        title: 'Service unavailable',
        description: 'The server is temporarily unavailable. Please try again later.',
        color: 'error',
        duration: 6000
      })
    }
  })

  return {
    provide: {
      handleFetchError: (error: NuxtError) => {
        const status = error?.response?.status ?? error?.statusCode
        const toast = useToast()

        if (status === 429) {
          toast.add({
            title: 'Slow down!',
            description: 'Too many requests. Please try again in a moment.',
            color: 'warning',
            duration: 6000
          })
        } else if (status === 503) {
          toast.add({
            title: 'Server unavailable',
            description: 'Please try again in a moment.',
            color: 'error',
            duration: 5000
          })
        } else if (status !== undefined && status >= 500) {
          toast.add({
            title: 'Server error',
            description: 'An unexpected error occurred.',
            color: 'error',
            duration: 5000
          })
        }
      }
    }
  }
})
