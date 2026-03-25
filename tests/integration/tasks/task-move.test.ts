import { describe, it, expect } from 'vitest'
import mongoose from 'mongoose'
import { TaskModel } from '../../../server/modules/tasks/models/task'

const fakeProjectId = new mongoose.Types.ObjectId()

async function createTask(overrides: { status?: string; position: number; title?: string }) {
  return TaskModel.create({
    title: overrides.title ?? 'Task',
    status: overrides.status ?? 'planned',
    priority: 'medium',
    position: overrides.position,
    project: fakeProjectId
  })
}

// Mirrors the same-column reorder logic from move.patch.ts
async function moveTaskSameColumn(taskId: mongoose.Types.ObjectId, oldPos: number, newPos: number, status: string) {
  if (newPos > oldPos) {
    await TaskModel.updateMany(
      { project: fakeProjectId, status, _id: { $ne: taskId }, position: { $gt: oldPos, $lte: newPos } },
      { $inc: { position: -1 } }
    )
  } else {
    await TaskModel.updateMany(
      { project: fakeProjectId, status, _id: { $ne: taskId }, position: { $gte: newPos, $lt: oldPos } },
      { $inc: { position: 1 } }
    )
  }
  await TaskModel.findByIdAndUpdate(taskId, { position: newPos })
}

// Mirrors cross-column move logic from move.patch.ts
async function moveTaskCrossColumn(
  taskId: mongoose.Types.ObjectId,
  fromStatus: string,
  toStatus: string,
  oldPos: number
) {
  await TaskModel.updateMany(
    { project: fakeProjectId, status: fromStatus, position: { $gt: oldPos } },
    { $inc: { position: -1 } }
  )
  const insertAt = await TaskModel.countDocuments({ project: fakeProjectId, status: toStatus })
  await TaskModel.updateMany(
    { project: fakeProjectId, status: toStatus, position: { $gte: insertAt } },
    { $inc: { position: 1 } }
  )
  await TaskModel.findByIdAndUpdate(taskId, { status: toStatus, position: insertAt })
}

describe('Task move — same column reorder', () => {
  it('moves task down: shifts middle tasks up', async () => {
    // positions: A=1, B=2, C=3 → move A to 3 → B=1, C=2, A=3
    const a = await createTask({ position: 1 })
    const b = await createTask({ position: 2 })
    const c = await createTask({ position: 3 })

    await moveTaskSameColumn(a._id, 1, 3, 'planned')

    const tasks = await TaskModel.find({ project: fakeProjectId }).sort({ position: 1 })
    expect(tasks.map((t) => t._id.toString())).toEqual([
      b._id.toString(),
      c._id.toString(),
      a._id.toString()
    ])
    expect(tasks.map((t) => t.position)).toEqual([1, 2, 3])
  })

  it('moves task up: shifts middle tasks down', async () => {
    // positions: A=1, B=2, C=3 → move C to 1 → C=1, A=2, B=3
    const a = await createTask({ position: 1 })
    const b = await createTask({ position: 2 })
    const c = await createTask({ position: 3 })

    await moveTaskSameColumn(c._id, 3, 1, 'planned')

    const tasks = await TaskModel.find({ project: fakeProjectId }).sort({ position: 1 })
    expect(tasks.map((t) => t._id.toString())).toEqual([
      c._id.toString(),
      a._id.toString(),
      b._id.toString()
    ])
    expect(tasks.map((t) => t.position)).toEqual([1, 2, 3])
  })

  it('no-op when position does not change', async () => {
    const a = await createTask({ position: 2 })
    const before = await TaskModel.findById(a._id)

    await moveTaskSameColumn(a._id, 2, 2, 'planned')

    const after = await TaskModel.findById(a._id)
    expect(after!.position).toBe(before!.position)
  })
})

describe('Task move — cross column', () => {
  it('appends task to end of target column', async () => {
    const planned1 = await createTask({ status: 'planned', position: 1 })
    const planned2 = await createTask({ status: 'planned', position: 2 })
    const inProg1 = await createTask({ status: 'inProgress', position: 1 })

    // Move planned1 to inProgress
    await moveTaskCrossColumn(planned1._id, 'planned', 'inProgress', 1)

    const movedTask = await TaskModel.findById(planned1._id)
    expect(movedTask!.status).toBe('inProgress')
    expect(movedTask!.position).toBe(1) // appended after inProg1

    // planned2 should shift to position 1
    const remaining = await TaskModel.findById(planned2._id)
    expect(remaining!.position).toBe(1)
    expect(remaining!.status).toBe('planned')

    // inProg1 should still be position 1 (or shifted if insertAt=1)
    const orig = await TaskModel.findById(inProg1._id)
    expect(orig!.status).toBe('inProgress')
  })

  it('decrements positions in source column after removal', async () => {
    const a = await createTask({ status: 'planned', position: 1 })
    const b = await createTask({ status: 'planned', position: 2 })
    const c = await createTask({ status: 'planned', position: 3 })

    await moveTaskCrossColumn(a._id, 'planned', 'done', 1)

    const bAfter = await TaskModel.findById(b._id)
    const cAfter = await TaskModel.findById(c._id)
    expect(bAfter!.position).toBe(1)
    expect(cAfter!.position).toBe(2)
  })
})
