import { getStringByLocale } from './intl-string-parser';
import { logger } from '../utils/logger';

export const mdbUserToGqlUser = (user, viewer) => {
  logger.debug(`in mdbUserToGqlUser`);
  try {
    let gqlUser = user.toObject();
    gqlUser.full_name = getStringByLocale(
      gqlUser.full_name,
      viewer.locale
    ).text;
    gqlUser.biography = getStringByLocale(
      gqlUser.biography,
      viewer.locale
    ).text;
    gqlUser.headline = getStringByLocale(gqlUser.headline, viewer.locale).text;
    // apply security
    if (gqlUser._id != viewer._id) {
      gqlUser.auth_strategies = [];
    }
    if (gqlUser.instructor_topics) {
      gqlUser.instructor_topics_en = gqlUser.instructor_topics;
      // TODO @stanvarlamov map en to user locale?
      gqlUser.instructor_topics_locale = gqlUser.instructor_topics;
    }
    return gqlUser;
  } catch (err) {
    return Promise.reject(err);
  }
};
