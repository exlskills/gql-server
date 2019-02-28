import * as UserCud from '../db-handlers/user/user-cud';
import { logger } from '../utils/logger';

export const updateUserProfile = async (locale, profile, viewer) => {
  try {
    // TODO if in the future required to have user update other than self, then this would need to be changes
    profile.id = viewer.user_id;

    const returnObj = await UserCud.updateUserProfile(locale, profile);
    return returnObj;
  } catch (error) {
    logger.error(
      `while updating User Profile for id ` + profile.id + ` ` + error
    );
    return {
      completionObj: {
        code: '1',
        msg: 'Profile Update Failed with an Error',
        msg_id: 'user_profile_update_failed'
      }
    };
  }
};

export const updateUserUnitStatus = async (unit_id, course_id, viewer) => {
  logger.debug(`in =====> updateUserUnitStatus`);
  try {
    // TODO - FUTURE this is not currently updating anything
    return { completionObj: { code: '0', msg: '' } };
  } catch (err) {
    return { completionObj: { code: '1', msg: err.message } };
  }
};
