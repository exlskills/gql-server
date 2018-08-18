import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
import Notification from '../db-models/notification-model';

export const createUserNotification = async (user_id, object) => {
  console.log(`in createUserNotification`);
  try {
    let userNotif = await Notification.findOne({ user_id }).exec();
    if (!userNotif) {
      userNotif = new Notification({
        user_id,
        notifications: []
      });
    }

    userNotif.notifications.push({
      actor: object.user_id,
      def_id: object.listDef_id,
      notification_link: object.notification_link,
      is_read: false
    });
    return await userNotif.save();
  } catch (err) {
    return Promise.reject('Error adding to DB', err);
  }
  return null;
};

export const markNotificationAsRead = async (user_id, notif_id) => {
  console.log(`in markNotificationAsRead`);
  try {
    let result;
    if (notif_id === 'all') {
      let records = await Notification.find({
        user_id,
        'notifications.is_read': false
      }).exec();
      result = { n: 0, nModified: 0, ok: 0 };
      for (let rec of records) {
        for (let notif of rec.notifications) {
          notif.is_read = true;
        }
        await rec.save();
        result.n = rec.notifications.length;
        result.nModified = result.n;
        result.ok = 1;
      }
    } else {
      result = await Notification.update(
        { user_id, 'notifications._id': ObjectId(notif_id) },
        { $set: { 'notifications.$.is_read': true } }
      ).exec();
    }
    return result;
  } catch (err) {
    return Promise.reject('Error markNotificationAsRead');
  }
};
