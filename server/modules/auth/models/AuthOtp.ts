import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export type AuthOtpPurpose = 'email_verification' | 'password_reset'

export interface IAuthOtp extends Document {
  userId: Types.ObjectId
  purpose: AuthOtpPurpose
  codeHash: string
  expiresAt: Date
  attempts: number
  consumedAt: Date | null
}

const authOtpSchema = new Schema<IAuthOtp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    purpose: {
      type: String,
      enum: ['email_verification', 'password_reset'],
      required: true,
      index: true
    },
    codeHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    consumedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

authOtpSchema.index({ userId: 1, purpose: 1 }, { unique: true })

export const AuthOtpModel: Model<IAuthOtp> =
  (mongoose.models.UserOtpCode as Model<IAuthOtp>) ||
  mongoose.model<IAuthOtp>('UserOtpCode', authOtpSchema)

