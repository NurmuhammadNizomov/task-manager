import { z } from 'zod'
import { apiSuccess, defineApiHandler, apiError } from '../../../utils/api-response'
import { TaskModel, type TaskStatus } from '../../../modules/tasks/models/task'
import { ProjectModel } from '../../../modules/projects/models/project'
import { readValidatedBody } from '../../../modules/auth/utils/validation'
import mongoose from 'mongoose'

const taskMoveSchema = z.object({
  newStatus: z.enum(['planned', 'inProgress', 'inReview', 'done']),
  newPosition: z.number().min(0),
  oldStatus: z.enum(['planned', 'inProgress', 'inReview', 'done']),
  oldPosition: z.number().min(0)
})

export default defineApiHandler(async (event) => {
  const taskId = event.context.params?.id
  const auth = event.context.auth
  const body = await readValidatedBody(event, taskMoveSchema)

  const task = await TaskModel.findById(taskId)
  if (!task) {
    return apiError(404, 'TASK_NOT_FOUND', 'Task not found.')
  }

  // Check if user has access to the project this task belongs to
  const project = await ProjectModel.findOne({
    _id: task.project,
    $or: [{ owner: auth.userId }, { members: auth.userId }]
  })

  if (!project) {
    return apiError(403, 'FORBIDDEN', 'You do not have access to this project.')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // If status is different, shift items in old and new columns
    if (body.oldStatus !== body.newStatus) {
      // Decrement positions in the old column
      await TaskModel.updateMany(
        { project: task.project, status: body.oldStatus, position: { $gt: body.oldPosition } },
        { $inc: { position: -1 } },
        { session }
      )
      // Increment positions in the new column
      await TaskModel.updateMany(
        { project: task.project, status: body.newStatus, position: { $gte: body.newPosition } },
        { $inc: { position: 1 } },
        { session }
      )
    } else {
      // If status is the same, just shift items within the same column
      if (body.newPosition > body.oldPosition) {
        await TaskModel.updateMany(
          { project: task.project, status: body.newStatus, position: { $gt: body.oldPosition, $lte: body.newPosition } },
          { $inc: { position: -1 } },
          { session }
        )
      } else {
        await TaskModel.updateMany(
          { project: task.project, status: body.newStatus, position: { $gte: body.newPosition, $lt: body.oldPosition } },
          { $inc: { position: 1 } },
          { session }
        )
      }
    }

    // Finally, update the moved task
    task.status = body.newStatus
    task.position = body.newPosition
    await task.save({ session })

    await session.commitTransaction()
    return apiSuccess({ message: 'Task moved successfully' })
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
})
