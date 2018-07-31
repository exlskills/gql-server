import User from '../../db-models/user-model';
import { id_gen } from '../../utils/url-id-generator';
import * as util from 'util';
import { toGlobalId, fromGlobalId } from 'graphql-relay';
export const createUser = async userObject => {
  const user_id = id_gen();
  userObject._id = user_id;
  try {
    await User.create(userObject);
    return user_id;
  } catch (err) {
    return Promise.reject('Error adding to DB', err);
  }
};

const setDefaultIntlStringLocale = (field, defLocale) => {
  const index = field.intlString.findIndex(item => item.locale == defLocale);
  if (index == -1) {
    return field;
  }

  for (let item of field.intlString) {
    item.is_default = item.locale == defLocale;
  }

  return field;
};

const updateIntlStringObject = (field, locale, newVal) => {
  const index = field.intlString.findIndex(item => item.locale == locale);

  if (index != -1) {
    field.intlString[index].content = newVal;
  } else {
    field.intlString.push({
      locale: locale,
      content: newVal,
      is_default: field.intlString.length == 0
    });
  }

  return field;
};
export const updateUserQuizlvl = async (user_id, unit_id, course_id) => {
  let user = await User.findOne({ _id: user_id }).exec();
  unit_id = fromGlobalId(unit_id).id;
  course_id = fromGlobalId(course_id).id;
  let arrayCourseRole = user.course_roles;
  for (let courserole of arrayCourseRole) {
    if (courserole.course_id == course_id) {
      if (courserole.course_unit_status) {
        if (courserole.course_unit_status.length > 0) {
          let arrayCourseUnitStatus = courserole.course_unit_status;
          let flagE = false;
          for (let unitStatus of arrayCourseUnitStatus) {
            if (unitStatus.unit_id == unit_id) {
              flagE = true;
              unitStatus.quiz_lvl = 1;
              unitStatus.quiz_lvl_updated_at = new Date();
            }
          }
          if (flagE == false) {
            let arrayUnitStatus = {
              unit_id: unit_id,
              quiz_lvl: 1,
              quiz_lvl_updated_at: new Date(),
              attempted_exam: true,
              attempted_exam_at: new Date()
            };
            courserole.course_unit_status.push(arrayUnitStatus);
          }
        } else {
          let arrayUnitStatus = {
            unit_id: unit_id,
            quiz_lvl: 1,
            quiz_lvl_updated_at: new Date(),
            attempted_exam: true,
            attempted_exam_at: new Date()
          };
          courserole.course_unit_status.push(arrayUnitStatus);
        }
      } else {
        let arrayUnitStatus = [
          {
            unit_id: unit_id,
            quiz_lvl: 1,
            quiz_lvl_updated_at: new Date(),
            attempted_exam: true,
            attempted_exam_at: new Date()
          }
        ];
        courserole.course_unit_status = arrayUnitStatus;
      }
    }
  }
  try {
    return await user.save();
  } catch (error) {
    return Promise.reject(Error('Cannot save user status, please check!'));
  }
};
export const updateUserProfile = async (locale, profile) => {
  let user = await User.findOne({ _id: profile.id }).exec();

  if (user) {
    const intlFields = ['full_name', 'headline', 'biography'];
    for (let field of intlFields) {
      const newData = updateIntlStringObject(
        user[field],
        locale,
        profile[field]
      );
      user[field] = setDefaultIntlStringLocale(newData, profile.primary_locale);
    }
    user.primary_email = profile.primary_email.toLowerCase();
    user.username = profile.username;
    user.primary_locale = profile.primary_locale;
    user.locales = profile.locales;

    try {
      return await user.save();
    } catch (error) {
      return Promise.reject(Error('Cannot save profile, please check!'));
    }
  }
  return null;
};
