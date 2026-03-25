import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'
import { getQuery } from 'h3'

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const { search, limit = '20', offset = '0', status = 'active' } = getQuery(event)

  const filter: Record<string, unknown> = {
    $or: [{ owner: auth.userId }, { members: auth.userId }],
    status
  }

  if (search && typeof search === 'string' && search.trim()) {
    filter.$or = [
      { owner: auth.userId, name: { $regex: search.trim(), $options: 'i' } },
      { owner: auth.userId, description: { $regex: search.trim(), $options: 'i' } },
      { members: auth.userId, name: { $regex: search.trim(), $options: 'i' } },
      { members: auth.userId, description: { $regex: search.trim(), $options: 'i' } }
    ]
  }

  const limitNum = Math.min(Number(limit) || 20, 100)
  const offsetNum = Number(offset) || 0

  const [projects, total] = await Promise.all([
    ProjectModel.find(filter)
      .populate('owner', 'fullName email')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(offsetNum)
      .limit(limitNum),
    ProjectModel.countDocuments(filter)
  ])

  return apiSuccess(projects, { total, limit: limitNum, offset: offsetNum })
})
