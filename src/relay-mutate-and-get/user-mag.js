import * as UserCud from '../db-handlers/user/user-cud';

export const updateUserProfile = async (locale, profile, viewer) => {
  try {
    await UserCud.updateUserProfile(locale, profile);
    return { completionObj: { code: '0', msg: '' } };
  } catch (error) {
    return { completionObj: { code: '1', msg: error.message } };
  }
};

export const updateUserUnitStatus = async (unit_id, course_id, viewer) => {
  try {
    const result = await UserCud.updateUserQuizlvl(
      viewer.user_id,
      unit_id,
      course_id
    );
    return { completionObj: { code: '0', msg: '' } };
  } catch (err) {
    return { completionObj: { code: '0', msg: err.message } };
  }
};
