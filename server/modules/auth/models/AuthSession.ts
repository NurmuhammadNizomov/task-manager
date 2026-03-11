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

export const AuthSessionModel: Model<IAuthSession> =
  (mongoose.models.UserSession as Model<IAuthSession>) ||
  mongoose.model<IAuthSession>('UserSession', authSessionSchema)

