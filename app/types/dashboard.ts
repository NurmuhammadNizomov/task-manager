export type TaskStatus = 'inProgress' | 'planned' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  title: string
  status: TaskStatus
  priority: TaskPriority
}

export interface DashboardStat {
  title: string
  value: string
  icon: string
  hint: string
}
