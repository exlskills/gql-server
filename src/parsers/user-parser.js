import { getStringByLocale } from './intl-string-parser';
import { logger } from '../utils/logger';
import { fetchLocalDescArrayByTypeAndValueArray } from '../db-handlers/list-def-fetch.js';

export const mdbUserToGqlUser = async (user, viewer) => {
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
    if (gqlUser._id !== viewer._id) {
      gqlUser.auth_strategies = [];
    }
    if (gqlUser.instructor_topics) {
      gqlUser.instructor_topics_en = gqlUser.instructor_topics;
      gqlUser.instructor_topics_locale = gqlUser.instructor_topics;
      if (viewer.locale !== 'en') {
        const listDefArray = await fetchLocalDescArrayByTypeAndValueArray(
          'instructor_topic',
          gqlUser.instructor_topics,
          viewer.locale
        );
        if (listDefArray) {
          gqlUser.instructor_topics_locale = [];
          for (let listDefRecord of listDefArray) {
            gqlUser.instructor_topics_locale.push(listDefRecord.desc);
          }
        }
      }
    }
    logger.debug(` gqlUser ` + JSON.stringify(gqlUser));
    return gqlUser;
  } catch (err) {
    logger.error(`In mdbUserToGqlUser ` + err);
    return Promise.reject(err);
  }
};
