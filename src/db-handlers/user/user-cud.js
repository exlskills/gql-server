import User from '../../db-models/user-model';
import { id_gen } from '../../utils/url-id-generator';
import {
  setDefaultIntlStringLocale,
  updateIntlStringObject
} from '../intl-string-utils';
import { fromGlobalId } from 'graphql-relay';
import { logger } from '../../utils/logger';

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
