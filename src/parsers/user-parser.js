import { getStringByLocale } from './intl-string-parser';

export const mdbUserToGqlUser = (user, viewer) => {
  console.log(`in mdbUserToGqlUser`);
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
    return gqlUser;
  } catch (err) {
    return Promise.reject(err);
  }
};
