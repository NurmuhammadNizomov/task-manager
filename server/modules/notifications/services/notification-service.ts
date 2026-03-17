import { NotificationModel, type INotification } from '../models/notification'
import { type Types } from 'mongoose'

export class NotificationService {
  static async createNotification(data: {
    recipient: string | Types.ObjectId
    sender?: string | Types.ObjectId
    type: INotification['type']
    title: string
    message: string
    link?: string
  }) {
    return await NotificationModel.create(data)
  }

  static async getNotifications(recipientId: string, limit: number = 20, offset: number = 0) {
    return await NotificationModel.find({ recipient: recipientId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('sender', 'fullName')
  }

  static async markAsRead(notificationId: string, recipientId: string) {
    return await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: recipientId },
      { isRead: true },
      { new: true }
    )
  }

  static async markAllAsRead(recipientId: string) {
    return await NotificationModel.updateMany(
      { recipient: recipientId, isRead: false },
      { isRead: true }
    )
  }

  static async deleteNotification(notificationId: string, recipientId: string) {
    return await NotificationModel.findOneAndDelete({ _id: notificationId, recipient: recipientId })
  }

  static async deleteAllNotifications(recipientId: string) {
    return await NotificationModel.deleteMany({ recipient: recipientId })
  }

  static async getUnreadCount(recipientId: string) {
    return await NotificationModel.countDocuments({ recipient: recipientId, isRead: false })
  }
}
