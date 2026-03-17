import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IAuthSession extends Document {
  userId: Types.ObjectId
  accessToken: string
  refreshTokenHash: string
  ipAddress?: string
  userAgent?: string
  lastUsedAt: Date
  createdAt: Date
  updatedAt: Date
}

const authSessionSchema = new Schema<IAuthSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    accessToken: {
      type: String,
      default: null
    },
    refreshTokenHash: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

// Indexes for common query patterns
// For finding all sessions for a user, sorted by most recently used
authSessionSchema.index({ userId: 1, lastUsedAt: -1 })
// For cleaning up old sessions based on their last activity
authSessionSchema.index({ lastUsedAt: 1 })

export const AuthSessionModel: Model<IAuthSession> =
  (mongoose.models.AuthSession as Model<IAuthSession>) ||
  mongoose.model<IAuthSession>('AuthSession', authSessionSchema)

