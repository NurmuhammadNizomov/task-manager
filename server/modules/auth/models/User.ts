import mongoose, { Schema, type Document, type Model } from 'mongoose'
import { comparePassword, hashPassword } from '../utils/password'

export type UserLanguage = 'en' | 'ru' | 'uz'
export type UserTheme = 'light' | 'dark' | 'system'

export interface IUser extends Document {
  fullName: string
  email: string
  password: string
  isEmailVerified: boolean
  language: UserLanguage
  theme: UserTheme
  comparePassword(candidatePassword: string): Promise<boolean>
}

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
      required: true,
      minlength: 8
    },
    isEmailVerified: {
      type: Boolean,
      default: false
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

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) {
    return next()
  }

  this.password = await hashPassword(this.password)
  return next()
})

userSchema.methods.comparePassword = function compare(candidatePassword: string) {
  return comparePassword(candidatePassword, this.password)
}

export const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema)

