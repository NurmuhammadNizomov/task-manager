import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IAuthToken extends Document {
  userId: Types.ObjectId
  emailVerificationToken: string | null
  emailVerificationExpires: Date | null
  passwordResetToken: string | null
  passwordResetExpires: Date | null
}

const authTokenSchema = new Schema<IAuthToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    emailVerificationExpires: {
      type: Date,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

export const AuthTokenModel: Model<IAuthToken> =
  (mongoose.models.UserSecurityToken as Model<IAuthToken>) ||
  mongoose.model<IAuthToken>('UserSecurityToken', authTokenSchema)

