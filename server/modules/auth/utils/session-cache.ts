import { AuthSessionModel } from '../models/AuthSession'
import type { IAuthSession } from '../models/AuthSession'

export class SessionCacheService {
  static async getSession(userId: string): Promise<IAuthSession | null> {
    return AuthSessionModel.findOne({ userId }).exec()
  }

  static async createOrUpdateSession(
    userId: string,
    accessToken: string,
    refreshToken: string
  ): Promise<IAuthSession | null> {
    try {
      const session = await AuthSessionModel.findOneAndUpdate(
        { userId },
        { $set: { accessToken, refreshToken } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      ).exec()
      return session
    } catch (err) {
      console.error('[SessionCache] Failed to save session:', err)
      return null
    }
  }

  static async deleteSession(userId: string): Promise<void> {
    await AuthSessionModel.findOneAndDelete({ userId }).exec()
  }

  static async invalidateSessionCache(userId: string): Promise<void> {
    // No-op: no cache layer
    void userId
  }
}
