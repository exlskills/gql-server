import { markNotificationAsRead } from '../db-handlers/notification-cud';

export const readNotification = async (notif_id, viewer) => {
  try {
    const result = await markNotificationAsRead(viewer.user_id, notif_id);

    return {
      completionObj: {
        code: '0',
        msg: '',
        processed: result.n,
        modified: result.nModified
      }
    };
  } catch (error) {
    return { completionObj: { code: '1', msg: error.message } };
  }
};
