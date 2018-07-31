import mongoose from 'mongoose';
import UserNotificationSchema from './user-notification-model';

const NotificationSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true
    },
    notifications: {
      type: [UserNotificationSchema],
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model(
  'Notification',
  NotificationSchema,
  'notification'
);
