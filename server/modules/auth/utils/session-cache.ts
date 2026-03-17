import { AuthSessionModel, type IAuthSession } from '../models/auth-session'
import { hashToken } from './token'

export class SessionCacheService {
  static async createOrUpdateSession(
    userId: string,
    accessToken: string,
    refreshToken: string
  ): Promise<IAuthSession | null> {
    try {
      const session = await AuthSessionModel.findOneAndUpdate(
        { userId },
        { $set: { accessToken, refreshTokenHash: hashToken(refreshToken) } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      ).exec()
      return session
    } catch (err) {
      console.error('[SessionCache] Failed to save session:', err)
      return null
    }
  }

  static async getSession(userId: string): Promise<IAuthSession | null> {
    try {
      return await AuthSessionModel.findOne({ userId }).exec()
    } catch {
      return null
    }
  }

  static async deleteSession(userId: string): Promise<void> {
    try {
      await AuthSessionModel.deleteMany({ userId }).exec()
    } catch (err) {
      console.error('[SessionCache] Failed to delete session:', err)
    }
  }
}
