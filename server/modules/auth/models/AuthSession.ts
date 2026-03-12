import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IAuthSession extends Document {
  userId: Types.ObjectId
  refreshToken: string | null
  accessToken: string | null
}

const authSessionSchema = new Schema<IAuthSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    refreshToken: {
      type: String,
      default: null
    },
    accessToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
)

// Compound indexes for common query patterns
authSessionSchema.index({ refreshToken: 1, userId: 1 }) // For refresh token validation
authSessionSchema.index({ accessToken: 1, userId: 1 }) // For access token validation
authSessionSchema.index({ updatedAt: 1 }) // For cleanup of old sessions
authSessionSchema.index({ userId: 1, updatedAt: -1 }) // For finding user's recent sessions

export const AuthSessionModel: Model<IAuthSession> =
  (mongoose.models.UserSession as Model<IAuthSession>) ||
  mongoose.model<IAuthSession>('UserSession', authSessionSchema)

