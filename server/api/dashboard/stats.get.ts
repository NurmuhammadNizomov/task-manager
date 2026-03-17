import dayjs from 'dayjs'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'
import { TaskModel } from '../../modules/tasks/models/task'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth

  // 1. Find all projects the user is part of
  const projects = await ProjectModel.find({
    $or: [{ owner: auth.userId }, { members: auth.userId }],
    isArchived: false
  })

  const projectIds = projects.map(p => p._id)

  // 2. Count open tasks
  const openTasksCount = await TaskModel.countDocuments({
    project: { $in: projectIds },
    status: { $ne: 'done' }
  })

  // 3. Count high priority open tasks
  const highPriorityTasksCount = await TaskModel.countDocuments({
    project: { $in: projectIds },
    status: { $ne: 'done' },
    priority: { $in: ['high', 'urgent'] }
  })

  // 4. Count tasks completed this week
  const oneWeekAgo = dayjs().subtract(7, 'day').toDate()
  
  const completedThisWeekCount = await TaskModel.countDocuments({
    project: { $in: projectIds },
    status: 'done',
    updatedAt: { $gte: oneWeekAgo }
  })

  // 5. Count unique members
  const memberSet = new Set<string>()
  projects.forEach(p => {
    p.members.forEach(m => memberSet.add(m.toString()))
    memberSet.add(p.owner.toString())
  })
  const totalMembersCount = memberSet.size

  return apiSuccess({
    openTasks: openTasksCount,
    highPriorityTasks: highPriorityTasksCount,
    completedThisWeek: completedThisWeekCount,
    totalMembers: totalMembersCount
  })
})
