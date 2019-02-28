import User from '../../db-models/user-model';
import { id_gen } from '../../utils/url-id-generator';
import {
  setDefaultIntlStringLocale,
  modifyIntlStringObject
} from '../../utils/intl-string-utils';
import { logger } from '../../utils/logger';
import { fetchById, fetchByKey } from '../../db-handlers/user/user-fetch';

export const createUser = async userObject => {
  logger.debug(`in createUser`);
  const user_id = id_gen();
  userObject._id = user_id;
  try {
    await User.create(userObject);
    return user_id;
  } catch (err) {
    return Promise.reject('Error adding to DB', err);
  }
};

export const updateUserProfile = async (locale, profile) => {
  logger.debug(` in updateUserProfile`);
  logger.debug(` profile object ` + JSON.stringify(profile));

  const profileUpdateIntlFields = ['full_name', 'headline', 'biography'];
  const profileDirectUpdateFields = [
    'username',
    //'primary_email',
    'avatar_url',
    'primary_locale',
    'locales',
    'is_public',
    'linkedin_username',
    'twitter_username'
  ];

  const selectVal = { primary_locale: 1 };
  for (let field of profileUpdateIntlFields) {
    selectVal[field] = 1;
  }

  const user = await fetchById(profile.id, selectVal, null, null);
  if (user) {
    if (profile.username) {
      profile.username = profile.username.toLowerCase();
      const dupRecord = await fetchByKey(
        {
          $and: [{ username: profile.username }, { _id: { $ne: profile.id } }]
        },
        { _id: 1 },
        null,
        null
      );
      if (dupRecord && dupRecord._id) {
        return {
          completionObj: {
            code: '1',
            msg: 'User Name Already Exists',
            msg_id: 'user_name_already_exists'
          }
        };
      }
    }

    /*
    if (profile.primary_email) {
      profile.primary_email = profile.primary_email.toLowerCase();
      // Bypass uniqueness check for privacy reasons
      const dupRecord = await fetchByKey(
        {
          $and: [
            { primary_email: profile.primary_email },
            { _id: { $ne: profile.id } }
          ]
        },
        { _id: 1 },
        null,
        null
      );
      if (dupRecord && dupRecord._id) {
        return {
          completionObj: {
            code: '1',
            msg: 'Primary Email Already Exists',
            msg_id: 'primary_email_already_exists'
          }
        };
      }
    }
    */

    if (!locale) {
      locale = profile.primary_locale
        ? profile.primary_locale
        : user.primary_locale;
    }
    const defaultLocale = profile.primary_locale
      ? profile.primary_locale
      : user.primary_locale;

    for (let field of profileUpdateIntlFields) {
      if (!profile[field]) {
        continue;
      }
      if (!user[field]) {
        user[field] = { intlString: [] };
      }
      const newData = modifyIntlStringObject(
        user[field],
        locale,
        profile[field]
      );
      user[field] = setDefaultIntlStringLocale(newData, defaultLocale);
    }

    for (let fld of profileDirectUpdateFields) {
      if (profile[fld]) {
        user[fld] = profile[fld];
      }
    }

    logger.debug(`user object ` + JSON.stringify(user));

    try {
      await user.save();
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
    return {
      completionObj: {
        code: '0',
        msg: '',
        msg_id: ''
      }
    };
  } else {
    return {
      completionObj: {
        code: '1',
        msg: 'User Not Found',
        msg_id: 'user_not_found'
      }
    };
  }
};
