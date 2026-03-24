import { Schema } from 'mongoose'
import type { IAuthSession } from '../types'
import { getModel } from '~/server/utils/model'

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
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

authSessionSchema.index({ userId: 1, lastUsedAt: -1 })
authSessionSchema.index({ lastUsedAt: 1 })

export const AuthSessionModel = getModel<IAuthSession>('AuthSession', authSessionSchema)
