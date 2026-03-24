import mongoose from 'mongoose'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'
import { TaskModel } from '../../modules/tasks/models/task'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const query = getQuery(event)
  const userId = new mongoose.Types.ObjectId(auth.userId)

  // Build project lookup match — restricts to user-accessible, non-archived projects
  const projectLookupMatch: Record<string, unknown> = {
    $or: [{ owner: userId }, { members: userId }],
    isArchived: false
  }
  if (query.projectId && typeof query.projectId === 'string') {
    projectLookupMatch._id = new mongoose.Types.ObjectId(query.projectId)
  }

  // Build task-level match
  const taskMatch: Record<string, unknown> = { 'projectData.0': { $exists: true } }
  if (query.status && typeof query.status === 'string') taskMatch.status = query.status
  if (query.priority && typeof query.priority === 'string') taskMatch.priority = query.priority
  if (query.assignedToMe === 'true') taskMatch.assignee = userId

  const [tasks, projects] = await Promise.all([
    TaskModel.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          pipeline: [{ $match: projectLookupMatch }, { $project: { name: 1 } }],
          as: 'projectData'
        }
      },
      { $match: taskMatch },
      {
        $lookup: {
          from: 'users',
          localField: 'assignee',
          foreignField: '_id',
          pipeline: [{ $project: { fullName: 1, email: 1, avatar: 1 } }],
          as: 'assigneeData'
        }
      },
      {
        $addFields: {
          project: { $arrayElemAt: ['$projectData', 0] },
          assignee: { $arrayElemAt: ['$assigneeData', 0] }
        }
      },
      { $project: { projectData: 0, assigneeData: 0 } },
      { $sort: { createdAt: -1 } }
    ]),

    ProjectModel.find(
      { $or: [{ owner: userId }, { members: userId }], isArchived: false },
      { name: 1 }
    ).lean()
  ])

  return apiSuccess({ tasks, projects })
})
