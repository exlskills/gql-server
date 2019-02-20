import * as UserCud from '../db-handlers/user/user-cud';
import { logger } from '../utils/logger';

export const updateUserProfile = async (locale, profile, viewer) => {
  try {
    // TODO if in the future required to have user update other than self, then this would need to be changes
    profile.id = viewer.user_id;
    await UserCud.updateUserProfile(locale, profile);
    return { completionObj: { code: '0', msg: '' } };
  } catch (error) {
    return { completionObj: { code: '1', msg: error.message } };
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
