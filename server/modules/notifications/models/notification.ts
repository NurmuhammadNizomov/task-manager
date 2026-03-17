import mongoose, { Schema, model, type Document, type Types } from 'mongoose'

export interface INotification extends Document {
  recipient: Types.ObjectId
  sender?: Types.ObjectId
  type: 'task_assigned' | 'task_updated' | 'project_invitation' | 'comment_added' | 'system'
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['task_assigned', 'task_updated', 'project_invitation', 'comment_added', 'system'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
)

export const NotificationModel = mongoose.models.Notification || model<INotification>('Notification', notificationSchema)
