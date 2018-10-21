import { logger } from '../../utils/logger';
import User from '../../db-models/user-model';
import * as projectionWriter from '../../utils/projection-writer';
import { findValuesByTypeAndDesc } from '../list-def';
import { getStringByLocale } from '../../parsers/intl-string-parser';

export const fetchUserList = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchUserList`);
  logger.debug(`   fetchParameters ` + JSON.stringify(fetchParameters));

  fetchParameters = fetchParameters ? fetchParameters : {};

  let locale = fetchParameters.primary_locale
    ? fetchParameters.primary_locale
    : viewerLocale;

  let elem;
  let array = [];
  const returnFields = {
    _id: 1,
    username: 1,
    primary_locale: 1,
    avatar_url: 1
  };

  let matchObj = {};

  if (filterValues) {
    matchObj = { ...filterValues };
  }

  const filters = fetchParameters.resolverArgs;

  if (filters.primary_locale) {
    matchObj = { ...matchObj, primary_locale: filters.primary_locale };
  }
  if (filters.username) {
    matchObj = { ...matchObj, username: filters.username };
  }

  if (filters.full_name) {
    matchObj = {
      ...matchObj,
      'full_name.intlString': {
        $elemMatch: {
          $or: [
            { locale: locale, content: { $regex: filters.full_name } },
            { is_default: true, content: { $regex: filters.full_name } }
          ]
        }
      }
    };
  }

  if (filters.text) {
    matchObj = {
      ...matchObj,
      $text: { $search: filters.full_name, $language: locale }
    };
  }

  if (filters.instructorTopics) {
    let instrTopicsEnArray = filters.instructorTopics;
    if (locale !== 'en') {
      instrTopicsEnArray = [];
      const listDefValues = findValuesByTypeAndDesc(
        'instructor_topic',
        filters.instructorTopics,
        locale
      );
      if (listDefValues && listDefValues.length > 0) {
        for (let listDef of listDefValues) {
          instrTopicsEnArray.push(listDef.value);
        }
      }
    }
    if (instrTopicsEnArray && instrTopicsEnArray.length > 0) {
      matchObj = {
        ...matchObj,
        instructor_topics: { $elemMatch: { $in: instrTopicsEnArray } }
      };
    }
  }

  logger.debug(`  matchObj ` + JSON.stringify(matchObj));
  if (JSON.stringify(matchObj) !== '{}') {
    elem = {
      $match: matchObj
    };
    array.push(elem);
  }

  elem = {
    $project: {
      ...returnFields,
      instructor_topics: 1,
      'full_name.intlString': projectionWriter.writeIntlStringFilter(
        'full_name',
        locale
      ),
      'headline.intlString': projectionWriter.writeIntlStringFilter(
        'headline',
        locale
      ),
      'biography.intlString': projectionWriter.writeIntlStringFilter(
        'biography',
        locale
      )
    }
  };
  array.push(elem);
  elem = {
    $project: {
      ...returnFields,
      instructor_topics_en: '$instructor_topics',
      instructor_topics_locale: '$instructor_topics',
      full_name: projectionWriter.writeIntlStringEval('full_name', locale),
      headline: projectionWriter.writeIntlStringEval('headline', locale),
      biography: projectionWriter.writeIntlStringEval('biography', locale)
    }
  };
  array.push(elem);

  if (locale !== 'en') {
    elem = {
      $lookup: {
        from: 'list_def',
        localField: 'instructor_topics_en',
        foreignField: 'value',
        as: 'list_def_topics'
      }
    };
    array.push(elem);
    elem = { $match: { 'list_def_topics.type': 'instructor_topic' } };
    array.push(elem);
  }

  let result = [];
  try {
    result = await User.aggregate(array).exec();
    logger.debug(`   fetchUserList aggr result ` + JSON.stringify(result));
  } catch (err) {
    return Promise.reject('Aggregation failed. Error ' + err);
  }

  if (locale !== 'en') {
    for (let record of result) {
      let instructor_topics_locale_array = [];
      if (record.list_def_topics) {
        for (let listdef of record.list_def_topics) {
          instructor_topics_locale_array.push(
            getStringByLocale(listdef.desc, locale).text
          );
        }
        delete record.list_def_topics;
      }
      record.instructor_topics_locale = instructor_topics_locale_array;
    }
  }

  return result;
};
