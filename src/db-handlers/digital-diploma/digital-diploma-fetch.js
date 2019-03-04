import DigitalDiploma from '../../db-models/digital-diploma-model';
import * as projectionWriter from '../../utils/projection-writer';
import { basicFind } from '../../db-handlers/basic-query-handler';
import { getStringByLocale } from '../../utils/intl-string-utils';
import { logger } from '../../utils/logger';
import { toClientUrlId } from '../../utils/client-url';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in DigitalDiploma fetchById`);

  // NOTE: always specify selectVal to pull only fields required - or use aggregations
  // E.g., { _id: 1, title: 1, headline: 1, description: 1 } or { plans: 0 }

  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      DigitalDiploma,
      {
        isById: true
      },
      obj_id,
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

const localizeDigitalDiplomaPlans = (plans, locale) => {
  if (!plans || !plans.length) {
    return [];
  }
  for (let plan of plans) {
    plan.title = getStringByLocale(plan.title, locale).text;
    plan.headline = getStringByLocale(plan.headline, locale).text;
  }
};

/**
 * Fetch DigitalDiplomas with filters and paging
 * @param {object} filterValues Contains `filterValuesString` as a free-form string
 *   to be used as a MDB expression in the $match operation
 * @param {array} aggregateArray Contains `$sort`, `$skip` and `$limit` object for the MDB query
 * @param {string} viewerLocale Locale of the current user to get text from Intl object
 * @param {object} fetchParameters Conditions to filter and display the courses list
 *   {array} courseIds: Fetch only the courses within the given `_id` list
 *   {string} userId: Lookup for the enrolled users
 *   {boolean} mine: Whether to fetch only user's courses, sort by last accessed time
 *   {string} roles: Require `mine` param. List of user roles on the course, separated by comma
 *   {boolean} relevant: Whether to fetch all courses but show user's courses first then the others
 *   {boolean} trending: Whether to fetch all courses and sort by enrolled count
 *   {string} topic: Topic value to filter out the courses
 * @return {Promise} The list of filtered courses on success, Promise.reject on error.
 */
export const fetchDigitalDiplomas = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchDigitalDiplomas`);
  let digitalDiplomaFields = {
    skill_level: 1,
    est_minutes: 1,
    primary_topic: 1,
    is_published: 1,
    is_project: 1,
    logo_url: 1,
    _id: 1,
    plans: 1
  };
  let digitalDiplomaIntlStringFields = {
    title: 1,
    headline: 1,
    description: 1
  };

  // TODO: find easier way for custom sort...
  // let sort = aggregateArray.find(item => !!item.$sort);
  let sort = {
    $sort: {
      title: 1
    }
  };
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);

  let array = [];
  let elem;

  if (fetchParameters.relevant) {
    elem = {
      $project: {
        ...digitalDiplomaIntlStringFields,
        ...digitalDiplomaFields
      }
    };
    array.push(elem);

    // TODO add relevancy logic based on Course counter fields
    /*
    sort = {
      $sort: {
        TBD
        title: 1
      }
    };
    */
  }

  if (fetchParameters.topic) {
    elem = {
      $match: {
        topics: fetchParameters.topic
      }
    };
    array.push(elem);
  }

  elem = {
    $project: {
      ...digitalDiplomaFields,
      'title.intlString': projectionWriter.writeIntlStringFilter(
        'title',
        viewerLocale
      ),
      'headline.intlString': projectionWriter.writeIntlStringFilter(
        'headline',
        viewerLocale
      ),
      'description.intlString': projectionWriter.writeIntlStringFilter(
        'description',
        viewerLocale
      )
    }
  };
  array.push(elem);

  elem = {
    $project: {
      ...digitalDiplomaFields,
      title: projectionWriter.writeIntlStringEval('title', viewerLocale),
      headline: projectionWriter.writeIntlStringEval('headline', viewerLocale),
      description: projectionWriter.writeIntlStringEval(
        'description',
        viewerLocale
      )
    }
  };
  array.push(elem);

  if (filterValues) {
    try {
      const objectFilter = JSON.parse(filterValues.filterValuesString);
      elem = {
        $match: objectFilter
      };
      array.push(elem);

      sort = {
        $sort: {
          title: 1
        }
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);

  const result = await DigitalDiploma.aggregate(array).exec();
  logger.debug(` fetchDigitalDiplomas result ` + JSON.stringify(result));
  if (result && result.length) {
    for (let diploma of result) {
      localizeDigitalDiplomaPlans(diploma.plans, viewerLocale);
    }
  }
  return result;
};

export const fetchDigitalDiploma = async (digital_diploma_id, viewer, info) => {
  logger.debug(`in fetchDigitalDiploma`);
  logger.debug(`   digital_diploma_id ` + digital_diploma_id);
  logger.debug(`   user_id ` + viewer.user_id);
  let digitalDiplomaRecord = await fetchById(
    digital_diploma_id,
    {},
    viewer,
    info
  );
  if (!digitalDiplomaRecord) {
    return {};
  }
  // logger.debug(`  digitalDiplomaRecord ` + digitalDiplomaRecord);
  digitalDiplomaRecord = digitalDiplomaRecord.toObject();
  digitalDiplomaRecord.title = getStringByLocale(
    digitalDiplomaRecord.title,
    viewer.locale
  ).text;
  digitalDiplomaRecord.headline = getStringByLocale(
    digitalDiplomaRecord.headline,
    viewer.locale
  ).text;
  digitalDiplomaRecord.description = getStringByLocale(
    digitalDiplomaRecord.description,
    viewer.locale
  ).text;
  digitalDiplomaRecord.info_md = getStringByLocale(
    digitalDiplomaRecord.info_md,
    viewer.locale
  ).text;

  localizeDigitalDiplomaPlans(digitalDiplomaRecord.plans, viewer.locale);

  return digitalDiplomaRecord;
};

export const getDigitalDiplomaUrl = async (
  digital_diploma_id,
  viewer,
  info
) => {
  logger.debug(`in getDigitalDiplomaUrl`);
  const digitalDiploma = await fetchById(digital_diploma_id, { title: 1 });
  const digitalDiplomaTitle = getStringByLocale(digitalDiploma.title, 'en')
    .text;
  return toClientUrlId(digitalDiplomaTitle, digital_diploma_id);
};
