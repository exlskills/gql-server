import { logger } from '../utils/logger';
import { basicFind } from '../db-handlers/basic-query-handler';
import Course from '../db-models/course-model';
import CourseDelivery from '../db-models/course-delivery-model';
import { courseCache, courseDeliveryCache } from './cache-objects';
import { sizeof } from '../utils/calc-field-size';
import { getStringByLocale } from '../utils/intl-string-utils';

export async function loadCourseCache(init_load, courseID) {
  logger.debug(`In loadCourseCache`);

  let objSize = 0;

  // General fields
  const genFields = [
    'primary_locale',
    'logo_url',
    'cover_url',
    'topics',
    'repo_url',
    'verified_cert_cost',
    'skill_level',
    'est_minutes',
    'primary_topic',
    'weight',
    'content_updated_at',
    'static_data_updated_at'
  ];

  // Locale-specific fields
  const localeFields = ['title', 'headline', 'description'];

  const extractedAt = new Date();

  // Excluded fields
  const selectVal = {
    is_organization_only: 0,
    subscription_level: 0,
    view_count: 0,
    enrolled_count: 0,
    units: 0,
    organization_ids: 0,
    instructor_timekit: 0
  };
  let runParams = null;
  let queryVal = null;
  if (init_load) {
    runParams = { isAll: true };
  } else if (courseID) {
    runParams = { isById: true };
    queryVal = courseID;
  } else {
    queryVal = { static_data_updated_at: { $gte: courseCache.updated_at } };
  }

  let courseDbObj;
  try {
    courseDbObj = await basicFind(
      Course,
      runParams,
      queryVal,
      { _id: 1 },
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return;
  }

  if (courseID && courseDbObj) {
    courseDbObj = [courseDbObj];
  }

  if (courseDbObj && courseDbObj.length > 0) {
    logger.debug(`course records ` + JSON.stringify(courseDbObj));
    courseCache.updated_at = extractedAt;
    logger.debug(`   CourseCache updated_at ` + courseCache.updated_at);

    for (let course of courseDbObj) {
      course = course.toObject();
      logger.debug(`Loading data for course ` + course._id);
      // logger.debug(`course ` + JSON.stringify(course));
      const oneCourseDataCache = {};
      objSize += sizeof(course._id);
      for (let genField of genFields) {
        // logger.debug(`genField ` + genField);
        if (course[genField]) {
          objSize += sizeof(genField);
          oneCourseDataCache[genField] = course[genField];
          // logger.debug(`course[genField] ` + JSON.stringify(course[genField]));
          objSize += sizeof(course[genField]);
        }
      }
      oneCourseDataCache['locale_data'] = {};
      objSize += sizeof('locale_data');
      for (let titleIntlString of course.title.intlString) {
        // logger.debug(`Loading data for locale ` + titleIntlString.locale);
        oneCourseDataCache['locale_data'][titleIntlString.locale] = {};
        objSize += sizeof(titleIntlString.locale);

        if (titleIntlString.is_default) {
          oneCourseDataCache.default_locale = titleIntlString.locale;
          objSize += sizeof(titleIntlString.locale);
          objSize += sizeof('default_locale');
        }

        for (let localeField of localeFields) {
          if (course[localeField]) {
            // logger.debug(`localeField ` + localeField);
            objSize += sizeof(localeField);
            const intlText = getStringByLocale(
              course[localeField],
              titleIntlString.locale
            ).text;
            oneCourseDataCache['locale_data'][titleIntlString.locale][
              localeField
            ] = intlText;
            // logger.debug(`intlText ` + intlText);
            objSize += sizeof(intlText);
            // logger.debug(`objSize after intlText ` + objSize);
          }
        }
      } // On intlString

      courseCache[course._id] = oneCourseDataCache;
    } // On courses

    logger.debug(`  loadCourseCache RESULT ` + JSON.stringify(courseCache));
    logger.debug(`  loadCourseCache RESULT Size ` + objSize);
  } else {
    logger.debug(`No course records extracted `);
  }
}

export async function loadCourseDeliveryCache(init_load, recordID) {
  logger.debug(`In loadCourseDeliveryCache`);

  let objSize = 0;

  const selectVal = null;
  let runParams = null;
  let queryVal = null;
  if (init_load) {
    runParams = { isAll: true };
  } else if (recordID) {
    runParams = { isById: true };
    queryVal = recordID;
  } else {
    queryVal = { updated_at: { $gte: courseDeliveryCache.updated_at } };
  }

  const extractedAt = new Date();

  let courseDeliveryDbObj;
  try {
    courseDeliveryDbObj = await basicFind(
      CourseDelivery,
      runParams,
      queryVal,
      { course_id: 1 },
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return;
  }

  if (recordID && courseDeliveryDbObj) {
    courseDeliveryDbObj = [courseDeliveryDbObj];
  }

  if (courseDeliveryDbObj && courseDeliveryDbObj.length > 0) {
    logger.debug(
      `course delivery records ` + JSON.stringify(courseDeliveryDbObj)
    );
    courseDeliveryCache.updated_at = extractedAt;
    logger.debug(
      `   CourseDeliveryCache updated_at ` + courseDeliveryCache.updated_at
    );

    for (let courseDeliveryRec of courseDeliveryDbObj) {
      courseDeliveryRec = courseDeliveryRec.toObject();
      logger.debug(
        `Loading data for course and locale ` +
          courseDeliveryRec.course_id +
          ` ` +
          courseDeliveryRec.locale
      );
      logger.debug(`course delivery rec ` + JSON.stringify(courseDeliveryRec));
      if (!courseDeliveryCache[courseDeliveryRec.course_id]) {
        courseDeliveryCache[courseDeliveryRec.course_id] = {};
      }
      courseDeliveryCache[courseDeliveryRec.course_id][
        courseDeliveryRec.locale
      ] = {
        ...courseDeliveryRec
      };
      delete courseDeliveryCache[courseDeliveryRec.course_id][
        courseDeliveryRec.locale
      ].course_id;
      delete courseDeliveryCache[courseDeliveryRec.course_id][
        courseDeliveryRec.locale
      ].locale;
    }
    logger.debug(
      `   loadCourseDeliveryCache RESULT ` + JSON.stringify(courseDeliveryCache)
    );
    // logger.debug(`   loadCourseDeliveryCache RESULT Size ` + objSize);
  } else {
    logger.debug(`No course delivery records extracted `);
  }
}
