import { Schema } from 'mongoose'
import { comparePassword, hashPassword } from '../utils/password'
import type { IUser } from '../types'
import { getModel } from '../../../utils/model'

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: false,
      minlength: 8
    },
    googleId: {
      type: String,
      sparse: true,
      index: true
    },
    authType: {
      type: String,
      enum: ['email', 'google', 'linked'],
      default: 'email'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true
    },
    avatar: {
      publicId: String,
      url: String
    },
    language: {
      type: String,
      enum: ['en', 'ru', 'uz'],
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    }
  },
  {
    timestamps: true
  }
)

// Compound indexes for common query patterns
userSchema.index({ email: 1, isEmailVerified: 1 }) // For finding verified/unverified users by email
userSchema.index({ isEmailVerified: 1, createdAt: -1 }) // For admin dashboards showing recent registrations
userSchema.index({ language: 1, isEmailVerified: 1 }) // For localization analytics
userSchema.index({ theme: 1, isEmailVerified: 1 }) // For theme usage analytics

userSchema.pre('save', async function preSave() {
  if (!this.isModified('password') || !this.password) {
    return
  }

  this.password = await hashPassword(this.password)
})

userSchema.methods.comparePassword = function compare(candidatePassword: string) {
  if (!this.password) {
    return Promise.resolve(false)
  }
  return comparePassword(candidatePassword, this.password)
}

export const UserModel = getModel<IUser>('User', userSchema)

