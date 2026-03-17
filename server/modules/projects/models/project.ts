import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IProject extends Document {
  name: string
  description?: string
  owner: Types.ObjectId
  members: Types.ObjectId[]
  isArchived: boolean
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    description: {
      type: String,
      maxlength: 500
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Find projects for a specific user (owner or member)
projectSchema.index({ owner: 1, isArchived: 1 })
projectSchema.index({ members: 1, isArchived: 1 })

export const ProjectModel: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ||
  mongoose.model<IProject>('Project', projectSchema)
