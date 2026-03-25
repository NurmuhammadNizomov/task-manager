import mongoose from 'mongoose'
import { apiSuccess, defineApiHandler } from '../../utils/api-response'
import { ProjectModel } from '../../modules/projects/models/project'

interface TeamMemberResult {
  _id: mongoose.Types.ObjectId
  fullName: string
  email: string
  avatar?: { url?: string }
  projects: { _id: mongoose.Types.ObjectId; name: string; isOwner: boolean }[]
}

export default defineApiHandler(async (event) => {
  const auth = event.context.auth
  const userId = new mongoose.Types.ObjectId(auth.userId)

  const members = await ProjectModel.aggregate<TeamMemberResult>([
    {
      $match: {
        $or: [{ owner: userId }, { members: userId }],
        status: 'active'
      }
    },
    {
      $addFields: {
        allParticipants: {
          $concatArrays: [
            [{ userId: '$owner', isOwner: true }],
            {
              $map: {
                input: {
                  $filter: {
                    input: '$members',
                    as: 'm',
                    cond: { $ne: ['$$m', '$owner'] }
                  }
                },
                as: 'm',
                in: { userId: '$$m', isOwner: false }
              }
            }
          ]
        }
      }
    },
    { $unwind: '$allParticipants' },
    {
      $lookup: {
        from: 'users',
        localField: 'allParticipants.userId',
        foreignField: '_id',
        pipeline: [{ $project: { fullName: 1, email: 1, avatar: 1 } }],
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    {
      $group: {
        _id: '$userInfo._id',
        fullName: { $first: '$userInfo.fullName' },
        email: { $first: '$userInfo.email' },
        avatar: { $first: '$userInfo.avatar' },
        projects: {
          $push: {
            _id: '$_id',
            name: '$name',
            isOwner: '$allParticipants.isOwner'
          }
        }
      }
    }
  ])

  const ownedProjectIds = await ProjectModel.distinct('_id', {
    owner: userId,
    status: 'active'
  })

  return apiSuccess({ members, ownedProjectIds })
})
