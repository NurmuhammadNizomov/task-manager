import { Schema, type Types } from 'mongoose'
import { getModel } from '../../../utils/model'

export interface IAuthToken {
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

authTokenSchema.index({ emailVerificationToken: 1, emailVerificationExpires: 1 })
authTokenSchema.index({ passwordResetToken: 1, passwordResetExpires: 1 })
authTokenSchema.index({ emailVerificationExpires: 1 })
authTokenSchema.index({ passwordResetExpires: 1 })
authTokenSchema.index({ userId: 1, emailVerificationExpires: 1 })
authTokenSchema.index({ userId: 1, passwordResetExpires: 1 })

export const AuthTokenModel = getModel<IAuthToken>('AuthToken', authTokenSchema)
