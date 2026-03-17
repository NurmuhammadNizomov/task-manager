import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export type TaskStatus = 'planned' | 'inProgress' | 'inReview' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface ITask extends Document {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  position: number // For ordering in the Kanban column
  project: Types.ObjectId
  assignee?: Types.ObjectId
  dueDate?: Date
  attachments: {
    publicId: string
    url: string
    filename: string
    mimeType: string
    size: number
  }[]
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      maxlength: 5000
    },
    status: {
      type: String,
      enum: ['planned', 'inProgress', 'inReview', 'done'],
      default: 'planned',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    position: {
      type: Number,
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    dueDate: {
      type: Date
    },
    attachments: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        filename: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
)

// Indexes for common queries
taskSchema.index({ project: 1, status: 1 })
taskSchema.index({ project: 1, assignee: 1 })
taskSchema.index({ project: 1, dueDate: 1 })

export const TaskModel: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) || mongoose.model<ITask>('Task', taskSchema)
