import dayjs from 'dayjs'
import mongoose from 'mongoose'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'
import { TaskModel } from '../../modules/tasks/models/task'

interface TaskStatsResult {
  openTasks: number
  highPriorityTasks: number
  completedThisWeek: number
}

interface MemberCountResult {
  totalMembers: number
}

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const userId = new mongoose.Types.ObjectId(auth.userId)
  const oneWeekAgo = dayjs().subtract(7, 'day').toDate()

  const [taskStats, memberStats] = await Promise.all([
    // Single $group pass: count all stats in one scan
    TaskModel.aggregate<TaskStatsResult>([
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          pipeline: [
            {
              $match: {
                $or: [{ owner: userId }, { members: userId }],
                isArchived: false
              }
            },
            { $project: { _id: 1 } }
          ],
          as: 'projectData'
        }
      },
      { $match: { 'projectData.0': { $exists: true } } },
      {
        $group: {
          _id: null,
          openTasks: {
            $sum: { $cond: [{ $ne: ['$status', 'done'] }, 1, 0] }
          },
          highPriorityTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'done'] },
                    { $in: ['$priority', ['high', 'urgent']] }
                  ]
                },
                1,
                0
              ]
            }
          },
          completedThisWeek: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'done'] },
                    { $gte: ['$updatedAt', oneWeekAgo] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $project: { _id: 0 } }
    ]),

    // Unique members: owner + members → unwind → group by id → count
    ProjectModel.aggregate<MemberCountResult>([
      {
        $match: {
          $or: [{ owner: userId }, { members: userId }],
          isArchived: false
        }
      },
      {
        $project: {
          allMembers: { $concatArrays: [['$owner'], '$members'] }
        }
      },
      { $unwind: '$allMembers' },
      { $group: { _id: '$allMembers' } },
      { $count: 'totalMembers' }
    ])
  ])

  const stats = taskStats[0]

  return apiSuccess({
    openTasks: stats?.openTasks ?? 0,
    highPriorityTasks: stats?.highPriorityTasks ?? 0,
    completedThisWeek: stats?.completedThisWeek ?? 0,
    totalMembers: memberStats[0]?.totalMembers ?? 0
  })
})
