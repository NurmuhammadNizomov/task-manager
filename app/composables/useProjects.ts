import type { ApiSuccessResponse } from '~/types/auth'

export type ProjectStatus = 'active' | 'archived' | 'completed'

export interface Project {
  _id: string
  name: string
  description?: string
  owner: {
    _id: string
    fullName: string
    email: string
  }
  members: string[]
  status: ProjectStatus
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export const useProjects = () => {
  const { t } = useI18n()
  const toast = useToast()

  const projects = useState<Project[]>('projects', () => [])
  const currentProject = useState<Project | null>('currentProject', () => null)
  const isLoading = useState<boolean>('projects:loading', () => false)
  const projectsTotal = useState<number>('projects:total', () => 0)

  const fetchProjects = async (params?: { search?: string; limit?: number; offset?: number; status?: ProjectStatus }) => {
    isLoading.value = true
    try {
      const query: Record<string, string> = {}
      if (params?.search) query.search = params.search
      if (params?.limit !== undefined) query.limit = String(params.limit)
      if (params?.offset !== undefined) query.offset = String(params.offset)
      if (params?.status) query.status = params.status

      const response = await $fetch<ApiSuccessResponse<Project[]>>('/api/projects', { query })
      projects.value = response.data
      projectsTotal.value = (response.meta?.total as number) ?? response.data.length
    } catch (_) {
      toast.add({ title: t('common.error'), description: t('projects.fetchError'), color: 'error' })
    } finally {
      isLoading.value = false
    }
  }

  const reorderProjects = async (ids: string[]) => {
    try {
      await $fetch('/api/projects/reorder', { method: 'PATCH', body: { ids } })
    } catch (_) { /* silent */ }
  }

  const fetchProjectById = async (id: string) => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiSuccessResponse<Project>>(`/api/projects/${id}`)
      currentProject.value = response.data
    } catch (_) {
      toast.add({
        title: t('common.error'),
        description: t('projects.fetchOneError'),
        color: 'error'
      })
      currentProject.value = null
    } finally {
      isLoading.value = false
    }
  }

  const createProject = async (name: string, description?: string) => {
    try {
      const response = await $fetch<ApiSuccessResponse<Project>>('/api/projects', {
        method: 'POST',
        body: { name, description }
      })
      projects.value.unshift(response.data)
      toast.add({
        title: t('common.success'),
        description: t('projects.createSuccess'),
        color: 'success'
      })
      return response.data
    } catch (_) {
      toast.add({
        title: t('common.error'),
        description: t('projects.createError'),
        color: 'error'
      })
      throw error
    }
  }

  const updateProject = async (projectId: string, payload: { name?: string; description?: string; status?: ProjectStatus }) => {
    try {
      const response = await $fetch<ApiSuccessResponse<Project>>(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: payload
      })
      const idx = projects.value.findIndex(p => p._id === projectId)
      if (idx !== -1) projects.value[idx] = response.data
      if (currentProject.value?._id === projectId) currentProject.value = response.data
      toast.add({ title: t('common.success'), description: t('projects.updateSuccess'), color: 'success' })
      return response.data
    } catch (_) {
      toast.add({ title: t('common.error'), description: t('projects.updateError'), color: 'error' })
      throw _
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      await $fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      projects.value = projects.value.filter(p => p._id !== projectId)
      toast.add({ title: t('common.success'), description: t('projects.deleteSuccess'), color: 'success' })
    } catch (_) {
      toast.add({ title: t('common.error'), description: t('projects.deleteError'), color: 'error' })
      throw _
    }
  }

  const addMember = async (projectId: string, email: string) => {
    try {
      await $fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        body: { email }
      })
      toast.add({ title: t('common.success'), description: t('projects.members.addSuccess'), color: 'success' })
      await fetchProjectById(projectId) // Refresh project data
    } catch (_) {
      toast.add({ title: t('common.error'), description: t('projects.members.addError'), color: 'error' })
    }
  }

  const removeMember = async (projectId: string, memberId: string) => {
    try {
      await $fetch(`/api/projects/${projectId}/members`, {
        method: 'DELETE',
        body: { memberId }
      })
      toast.add({ title: t('common.success'), description: t('projects.members.removeSuccess'), color: 'success' })
      await fetchProjectById(projectId) // Refresh project data
    } catch (_) {
      toast.add({ title: t('common.error'), description: t('projects.members.removeError'), color: 'error' })
    }
  }

  return {
    projects,
    currentProject,
    isLoading,
    projectsTotal,
    fetchProjects,
    reorderProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember
  }
}
