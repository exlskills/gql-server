import Course from '../../db-models/course-model';
import * as projectionWriter from '../../utils/projection-writer';
import { basicFind } from '../../db-handlers/basic-query-handler';
import { getStringByLocale } from '../../utils/intl-string-utils';
import { logger } from '../../utils/logger';
import { toClientUrlId } from '../../utils/client-url';
import {
  checkUserViewedCard,
  getLastAccessedCourseItemForUser
} from '../card-interaction-fetch';
import { computeQuestionsEMA } from '../question/question-interaction-fetch';
import { getUserCoursesAndRoles } from '../user/user-course-role-fetch';
import { courseCache } from '../../data-cache/cache-objects';
import { getCourseUserLocale } from '../../data-cache/course-cache';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in Course fetchById`);

  // NOTE: always specify selectVal to pull only fields required - or use aggregations
  // E.g., { _id: 1, title: 1, headline: 1, description: 1 } or { units: 0 }

  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      Course,
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

export const fetchOneCourseRecord = async (
  queryVal,
  selectVal,
  viewer,
  info
) => {
  logger.debug(`in fetchOneCourseRecord`);
  logger.debug(`  queryVal ` + JSON.stringify(queryVal));

  // NOTE: always specify selectVal to pull only fields required - or use aggregations
  // E.g., { _id: 1, title: 1, headline: 1, description: 1 } or { units: 0 }

  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      Course,
      {
        isOne: true
      },
      queryVal,
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

/**
 * Fetch Courses with filters and paging
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
export const fetchCourses = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  //logger.debug(`in fetchCourses`);
  logger.debug(
    `in fetchCourses Fetch Parameters ` + JSON.stringify(fetchParameters)
  );
  let courseFields = {
    subscription_level: 1,
    enrolled_count: 1,
    verified_cert_cost: 1,
    skill_level: 1,
    est_minutes: 1,
    primary_topic: 1,
    view_count: 1,
    logo_url: 1,
    _id: 1,
    weight: { $ifNull: ['$weight', 0] }
  };
  let courseIntlStringFields = {
    title: 1,
    headline: 1,
    description: 1
  };

  // Default sort is overridden below for specific queries
  let sort = {
    $sort: {
      title: 1
    }
  };

  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);

  let array = [];
  let elem;

  if (fetchParameters.courseIds) {
    elem = {
      $match: {
        _id: {
          $in: fetchParameters.courseIds
        }
      }
    };
    array.push(elem);
  }

  if (fetchParameters.userId) {
    // Pull this User's record
    elem = { $addFields: { userid: fetchParameters.userId } };
    array.push(elem);

    elem = {
      $lookup: {
        from: 'user',
        localField: 'userid',
        foreignField: '_id',
        as: 'users'
      }
    };
    array.push(elem);
  }

  if (fetchParameters.mine && fetchParameters.userId) {
    // Note, we only merge Courses with Users if the userId is provided
    // Otherwise, the query performance is unacceptable
    elem = {
      $unwind: '$users'
    };
    array.push(elem);

    elem = {
      $project: {
        ...courseIntlStringFields,
        ...courseFields,
        'users.course_roles': {
          $filter: {
            input: '$users.course_roles',
            cond: {
              $eq: ['$$this.course_id', '$_id']
            }
          }
        }
      }
    };
    array.push(elem);

    if (fetchParameters.roles) {
      // filter courses by specific roles
      elem = {
        $match: {
          'users.course_roles.role': {
            $elemMatch: {
              $in: fetchParameters.roles.split(',')
            }
          }
        }
      };
    } else {
      // filter courses to those where the user has any role
      elem = {
        $match: {
          'users.course_roles.course_id': { $exists: true }
        }
      };
    }
    array.push(elem);

    elem = {
      $addFields: {
        last_accessed_at: '$users.course_roles.last_accessed_at'
      }
    };
    array.push(elem);

    courseFields.last_accessed_at = 1;

    sort = {
      $sort: {
        last_accessed_at: -1
      }
    };
  }

  if (fetchParameters.relevant) {
    elem = {
      $project: {
        ...courseIntlStringFields,
        ...courseFields
      }
    };
    array.push(elem);

    sort = {
      $sort: {
        weight: -1,
        title: 1
      }
    };
  }

  if (fetchParameters.trending) {
    elem = {
      $project: {
        ...courseIntlStringFields,
        ...courseFields
      }
    };
    array.push(elem);

    // TODO - enrolled_count is not maintained, review the logic
    sort = {
      $sort: {
        enrolled_count: -1,
        title: 1
      }
    };
  }

  if (fetchParameters.topic) {
    elem = {
      $match: {
        topics: fetchParameters.topic
      }
    };
    array.push(elem);
  }

  if (fetchParameters.primary_topic) {
    elem = {
      $match: {
        primary_topic: fetchParameters.primary_topic
      }
    };
    array.push(elem);
  }

  elem = {
    $project: {
      ...courseFields,
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
      ...courseFields,
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

  const result = await Course.aggregate(array).exec();
  logger.debug(` fetchCourses result ` + JSON.stringify(result));
  return result;
};

export const fetchCourseAndCardInteraction = async (
  course_id,
  viewer,
  info
) => {
  logger.debug(`in fetchCourseAndCardInteraction`);
  logger.debug(`   course_id ` + course_id);
  logger.debug(`   user_id ` + viewer.user_id);
  let courseRecord = await fetchById(
    course_id,
    {
      units: 0
    },
    viewer,
    info
  );
  if (!courseRecord) {
    return {};
  }
  // logger.debug(`  courseRecord ` + courseRecord);
  courseRecord = courseRecord.toObject();
  courseRecord.title = getStringByLocale(
    courseRecord.title,
    viewer.locale
  ).text;
  courseRecord.headline = getStringByLocale(
    courseRecord.headline,
    viewer.locale
  ).text;
  courseRecord.description = getStringByLocale(
    courseRecord.description,
    viewer.locale
  ).text;
  courseRecord.info_md = getStringByLocale(
    courseRecord.info_md,
    viewer.locale
  ).text;

  const lastAccessedObj = await getLastAccessedCourseItemForUser(
    viewer.user_id,
    course_id
  );

  courseRecord = { ...courseRecord, ...lastAccessedObj };
  logger.debug(
    `    fetchCourseAndCardInteraction result ` + JSON.stringify(courseRecord)
  );
  return courseRecord;
};

export const getCourseUrl = async (course_id, viewer, info) => {
  logger.debug(`in getCourseUrl`);
  const course = await fetchById(course_id, { title: 1 });
  const courseTitle = getStringByLocale(course.title, 'en').text;
  return toClientUrlId(courseTitle, course_id);
};

export const calcUserCourseEma = async (course_id, viewer) => {
  logger.debug(`in fetchCourseUnitsWithDetailedStatus`);

  const aggregateArray = [];
  const fetchParameters = {
    courseId: course_id
  };

  const arrayCourseStructure = await fetchCourseStructure(
    null,
    aggregateArray,
    viewer.locale,
    fetchParameters,
    true
  );

  const userId = viewer.user_id;

  let courseEmaSum = 0;
  let courseEmaCount = 0;

  for (let unitElem of arrayCourseStructure) {
    let unitEmaSum = 0;
    let unitEmaCount = 0;

    for (let sectionElem of unitElem.sections) {
      let sectEmaSum = 0;
      let sectEmaCount = 0;

      // Section Cards
      for (let card of sectionElem.cards.Cards) {
        let cardEma = 0;

        // Returns card_interaction.action array (in the current design,only last action is recorded)
        const user_card_view = await checkUserViewedCard(userId, card._id);
        if (user_card_view && user_card_view.length > 0) {
          cardEma = 100;
        }
        if (card.question_ids && card.question_ids.length > 0) {
          cardEma = await computeQuestionsEMA(userId, card.question_ids);
        }

        sectEmaSum += cardEma;
        sectEmaCount++;
      }

      // End of Section
      unitEmaSum += sectEmaSum;
      unitEmaCount += sectEmaCount;
      // sectionElem.ema = sectEmaCount > 0 ? sectEmaSum / sectEmaCount : 0;
    }

    courseEmaSum += unitEmaSum;
    courseEmaCount += unitEmaCount;

    // unitElem.ema = unitEmaCount > 0 ? unitEmaSum / unitEmaCount : 0;
  } // End of loop on Course Units

  let courseEma = courseEmaCount > 0 ? courseEmaSum / courseEmaCount : 0;
  logger.debug(`   courseEma ` + courseEma);
  return courseEma;
};

export const fetchCourseStructure = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters,
  include_sections = true
) => {
  logger.debug(`in fetchCourseStructure`);
  let array = [];
  let elem;

  elem = { $match: { _id: fetchParameters.courseId } };
  array.push(elem);

  elem = { $addFields: { 'units.Units.courseId': '$_id' } };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$units' } };
  array.push(elem);
  elem = { $unwind: '$Units' };
  array.push(elem);

  // Filter By specific Unit
  if (fetchParameters.unitId) {
    elem = { $match: { 'Units._id': fetchParameters.unitId } };
    array.push(elem);
  }

  if (fetchParameters.unitIndex) {
    elem = { $match: { 'Units.index': fetchParameters.unitIndex } };
    array.push(elem);
  }

  elem = {
    $project: {
      _id: 0,
      courseId: '$Units.courseId',
      unitId: '$Units._id',
      unitIndex: '$Units.index'
    }
  };
  if (include_sections) {
    elem.$project.sections = '$Units.sections.Sections';
  }
  array.push(elem);

  if (include_sections) {
    elem = {
      $project: {
        courseId: 1,
        unitId: 1,
        unitIndex: 1,
        'sections._id': 1,
        'sections.index': 1,
        'sections.cards.Cards._id': 1,
        'sections.cards.Cards.index': 1,
        'sections.cards.Cards.question_ids': 1
      }
    };
    array.push(elem);
  }

  if (aggregateArray) {
    // array.push(...aggregateArray);
    // let sort = aggregateArray.find(item => !!item.$sort);
    let sort = { $sort: { index: 1 } };
    let skip = aggregateArray.find(item => !!item.$skip);
    let limit = aggregateArray.find(item => !!item.$limit);

    if (sort) array.push(sort);
    if (skip) array.push(skip);
    if (limit) array.push(limit);
  }

  const result = await Course.aggregate(array).exec();

  logger.debug('fetchCourseStructure result ' + JSON.stringify(result));
  return result;
};

export const fetchCoursesCache = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  //logger.debug(`in fetchCoursesCache`);
  logger.debug(
    `in fetchCoursesCache Fetch Parameters ` + JSON.stringify(fetchParameters)
  );
  logger.debug(
    `in fetchCoursesCache Aggregate Array ` + JSON.stringify(aggregateArray)
  );

  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);
  logger.debug(` limit ` + JSON.stringify(limit));

  let result = [];

  let courseScopeArray = [];
  let userScopeArray = [];
  if (fetchParameters.courseIds) {
    courseScopeArray = fetchParameters.courseIds;
  }
  if (fetchParameters.mine && fetchParameters.userId) {
    const rolesArray = fetchParameters.roles
      ? fetchParameters.roles.split(',')
      : [];
    userScopeArray = await getUserCoursesAndRoles(
      fetchParameters.userId,
      fetchParameters.courseIds,
      rolesArray
    );
    if (userScopeArray.length < 1) {
      logger.debug(` fetchCoursesCache result - no matching User/Role records`);
      return [];
    }
    for (let userScopeRec of userScopeArray) {
      courseScopeArray.push(userScopeRec.course_id);
    }
  }

  for (let courseId of Object.keys(courseCache)) {
    logger.debug(`courseCache key ` + courseId);
    if (courseId === 'updated_at') {
      continue;
    }
    if (courseScopeArray.length > 0 && !courseScopeArray.includes(courseId)) {
      continue;
    }
    if (
      fetchParameters.primary_topic &&
      courseCache[courseId].primary_topic !== fetchParameters.primary_topic
    ) {
      continue;
    }
    if (
      fetchParameters.topic &&
      !courseCache[courseId].topics.includes(fetchParameters.topic)
    ) {
      continue;
    }

    const outputObj = {
      _id: courseId,
      subscription_level: courseCache[courseId].subscription_level,
      skill_level: courseCache[courseId].skill_level,
      primary_topic: courseCache[courseId].primary_topic,
      est_minutes: courseCache[courseId].est_minutes,
      logo_url: courseCache[courseId].logo_url,
      verified_cert_cost: courseCache[courseId].verified_cert_cost,
      weight: courseCache[courseId].weight ? courseCache[courseId].weight : 0
    };

    // TODO Future
    outputObj.view_count = 0;
    outputObj.enrolled_count = 0;

    const locale = getCourseUserLocale(viewerLocale, courseId);
    outputObj.title = courseCache[courseId].locale_data[locale].title;
    outputObj.headline = courseCache[courseId].locale_data[locale].headline;
    outputObj.description =
      courseCache[courseId].locale_data[locale].description;

    if (userScopeArray.length > 0) {
      const userRec = userScopeArray.find(e => e.course_id === courseId);
      // Catch-all default to "never accessed"
      // last_accessed_at should always be populated in getUserCoursesAndRoles
      outputObj.last_accessed_at = userRec.last_accessed_at
        ? userRec.last_accessed_at
        : new Date('2000-01-01T00:00:00');
    }

    logger.debug(` outputObj ` + JSON.stringify(outputObj));
    result.push(outputObj);
  }

  if (fetchParameters.mine && fetchParameters.userId) {
    result.sort(
      (a, b) => b.last_accessed_at.getTime() - a.last_accessed_at.getTime()
    );
  }

  // Note: in current logic, each sort overrides those above
  if (fetchParameters.relevant) {
    result.sort((a, b) => {
      if (b.weight === a.weight) {
        return a.title.localeCompare(b.title);
      }
      return b.weight - a.weight;
    });
  }

  // TODO - enrolled_count is not maintained, review the logic
  if (fetchParameters.trending) {
    result.sort((a, b) => {
      if (b.enrolled_count === a.enrolled_count) {
        return a.title.localeCompare(b.title);
      }
      return b.enrolled_count - a.enrolled_count;
    });
  }

  if (skip) {
    const skipVal = skip.$skip;
    if (skipVal >= result.length) {
      result = [];
    } else {
      result = result.slice(skipVal);
    }
  }

  if (limit) {
    const limitVal = limit.$limit;
    if (limitVal < result.length) {
      result = result.slice(0, limitVal);
    }
  }

  logger.debug(` fetchCoursesCache result ` + JSON.stringify(result));
  return result;
};

export const fetchCourseAndCardInteractionCache = async (
  course_id,
  viewer,
  info
) => {
  logger.debug(`in fetchCourseAndCardInteractionCache`);
  logger.debug(`   course_id ` + course_id);
  logger.debug(`   user_id ` + viewer.user_id);

  if (!courseCache[course_id]) {
    logger.error(`Course is not in cache ` + course_id);
    return await fetchCourseAndCardInteraction(course_id, viewer, info);
  }

  let courseRecord = { _id: course_id, ...courseCache[course_id] };
  delete courseRecord.locale_data;

  const locale = getCourseUserLocale(viewer.locale, course_id);

  courseRecord.title = courseCache[course_id].locale_data[locale].title;
  courseRecord.headline = courseCache[course_id].locale_data[locale].headline;
  courseRecord.description =
    courseCache[course_id].locale_data[locale].description;
  courseRecord.info_md = courseCache[course_id].locale_data[locale].info_md;

  const lastAccessedObj = await getLastAccessedCourseItemForUser(
    viewer.user_id,
    course_id
  );

  courseRecord = { ...courseRecord, ...lastAccessedObj };
  logger.debug(
    `    fetchCourseAndCardInteractionCache result ` +
      JSON.stringify(courseRecord)
  );
  return courseRecord;
};
