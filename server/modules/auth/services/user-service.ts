import { UserModel } from '../models/user'
import { apiError } from '../../../utils/api-response'
import { tServer } from '../../../utils/i18n'
import type { H3Event } from 'h3'
import type { UpdatePreferencesData } from '../types'

export class UserService {
  /**
   * Gets user by ID
   */
  static async getUserById(event: H3Event, userId: string) {
    const user = await UserModel.findById(userId).select('-password')
    if (!user) {
      apiError(404, 'USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
    }
    return user
  }

  /**
   * Updates user preferences (language and theme)
   */
  static async updatePreferences(event: H3Event, userId: string, data: UpdatePreferencesData) {
    const user = await UserModel.findById(userId)
    if (!user) {
      apiError(404, 'USER_NOT_FOUND', tServer(event, 'errors.userNotFound'))
    }

    if (data.language) {
      user.language = data.language as any
    }

    if (data.theme) {
      user.theme = data.theme as any
    }

    await user.save()
    return user
  }
}
