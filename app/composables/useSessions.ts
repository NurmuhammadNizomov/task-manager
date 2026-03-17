import UAParser from 'ua-parser-js'

export interface Session {
  _id: string
  userId: string
  refreshTokenHash: string
  ipAddress?: string
  userAgent?: string
  lastUsedAt: string
  createdAt: string
}

export const useSessions = () => {
  const sessions = ref<Session[]>([])
  const isLoading = ref(false)
  const toast = useToast()

  const fetchSessions = async () => {
    isLoading.value = true
    try {
      const response = await $fetch<any>('/api/user/sessions')
      sessions.value = response.data
    } catch (error) {
      toast.add({ title: 'Failed to fetch sessions', color: 'red' })
    } finally {
      isLoading.value = false
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      await $fetch(`/api/user/sessions/${sessionId}`, { method: 'DELETE' })
      sessions.value = sessions.value.filter(s => s._id !== sessionId)
      toast.add({ title: 'Session revoked', color: 'green' })
    } catch (error) {
      toast.add({ title: 'Failed to revoke session', color: 'red' })
    }
  }

  const revokeAllOtherSessions = async () => {
    try {
      await $fetch('/api/user/sessions/logout-all', { method: 'POST' })
      await fetchSessions() // Refresh the list
      toast.add({ title: 'All other sessions revoked', color: 'green' })
    } catch (error) {
      toast.add({ title: 'Failed to revoke sessions', color: 'red' })
    }
  }

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return 'lucide:laptop'
    const parser = new UAParser(userAgent)
    const device = parser.getDevice()

    if (device.type === 'mobile' || device.type === 'tablet') {
      return 'lucide:smartphone'
    }
    return 'lucide:laptop'
  }

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown Device'
    const parser = new UAParser(userAgent)
    const browser = parser.getBrowser()
    const os = parser.getOS()
    return `${browser.name || ''} on ${os.name || 'Unknown OS'}`
  }

  return {
    sessions,
    isLoading,
    fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
    getDeviceIcon,
    getDeviceInfo
  }
}
