import type { ApiSuccessResponse } from '~/types/auth'

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
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export const useProjects = () => {
  const { t } = useI18n()
  const toast = useToast()

  const projects = useState<Project[]>('projects', () => [])
  const currentProject = useState<Project | null>('currentProject', () => null)
  const isLoading = useState<boolean>('projects:loading', () => false)

  const fetchProjects = async () => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiSuccessResponse<Project[]>>('/api/projects')
      projects.value = response.data
    } catch (error) {
      toast.add({
        title: t('common.error'),
        description: t('projects.fetchError'),
        color: 'error'
      })
    } finally {
      isLoading.value = false
    }
  }

  const fetchProjectById = async (id: string) => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiSuccessResponse<Project>>(`/api/projects/${id}`)
      currentProject.value = response.data
    } catch (error) {
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

  const createProject = async (name: string) => {
    try {
      const response = await $fetch<ApiSuccessResponse<Project>>('/api/projects', {
        method: 'POST',
        body: { name }
      })
      projects.value.unshift(response.data)
      toast.add({
        title: t('common.success'),
        description: t('projects.createSuccess'),
        color: 'success'
      })
      return response.data
    } catch (error) {
      toast.add({
        title: t('common.error'),
        description: t('projects.createError'),
        color: 'error'
      })
      throw error
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
    } catch (error) {
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
    } catch (error) {
      toast.add({ title: t('common.error'), description: t('projects.members.removeError'), color: 'error' })
    }
  }

  return {
    projects,
    currentProject,
    isLoading,
    fetchProjects,
    fetchProjectById,
    createProject,
    addMember,
    removeMember
  }
}
