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

// Compound indexes for common query patterns
authTokenSchema.index({ emailVerificationToken: 1, emailVerificationExpires: 1 }) // For email verification validation
authTokenSchema.index({ passwordResetToken: 1, passwordResetExpires: 1 }) // For password reset validation
authTokenSchema.index({ emailVerificationExpires: 1 }) // For cleanup of expired email verification tokens
authTokenSchema.index({ passwordResetExpires: 1 }) // For cleanup of expired password reset tokens
authTokenSchema.index({ userId: 1, emailVerificationExpires: 1 }) // For user-specific email verification lookups
authTokenSchema.index({ userId: 1, passwordResetExpires: 1 }) // For user-specific password reset lookups

export const AuthTokenModel: Model<IAuthToken> =
  (mongoose.models.AuthToken as Model<IAuthToken>) ||
  mongoose.model<IAuthToken>('AuthToken', authTokenSchema)

