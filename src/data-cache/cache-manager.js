import config from '../config';
import { logger } from '../utils/logger';
import { courseDataCache, courseDeliveryDataCache } from './cache-objects';
import Course from '../db-models/course-model';
import { getStringByLocale } from '../utils/intl-string-utils';
import { sizeof } from '../utils/calc-field-size';
import { basicFind } from '../db-handlers/basic-query-handler';
import CourseDelivery from '../db-models/course-delivery-model';
import { delay } from '../utils/timeout';

export const initCacheLoad = async () => {
  // Initial Load
  await Promise.all([loadCourseCache(), loadCourseDeliveryCache()]);

  for (;;) {
    logger.debug(`pausing for min(s) ` + config.cacheRefreshIntervalMin);
    await delay(1000 * 60 * config.cacheRefreshIntervalMin);
    await updateCache();
  }
};

async function updateCache() {
  await Promise.all([updateCourseCache(), updateCourseDeliveryCache()]);
}

async function updateCourseCache() {
  logger.debug(`In updateCourseCache`);

  const coursesDbObj = await basicFind(
    Course,
    {
      isAll: true
    },
    null,
    null,
    { content_updated_at: 1, metadata_updated_at: 1 }
  );

  for (let course of coursesDbObj) {
    if (!courseDataCache[course._id]) {
      // Wait for completion of individual course calls for better process control
      await loadCourseCache(course._id);
    } else {
      if (course.content_updated_at) {
        if (!courseDataCache[course._id]['content_updated_at']) {
          await loadCourseCache(course._id);
        } else if (
          course.content_updated_at >
          courseDataCache[course._id]['content_updated_at']
        ) {
          await loadCourseCache(course._id);
        }
      }
      if (course.metadata_updated_at) {
        if (!courseDataCache[course._id]['metadata_updated_at']) {
          await loadCourseCache(course._id);
        } else if (
          course.metadata_updated_at >
          courseDataCache[course._id]['metadata_updated_at']
        ) {
          await loadCourseCache(course._id);
        }
      }
    }
  } // On courses
}

async function loadCourseCache(courseID) {
  logger.debug(`In loadCourseCache`);

  let objSize = 0;

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
    'metadata_updated_at'
  ];

  // Locale-specific fields
  const localeFields = ['title', 'headline', 'description'];

  let oneCourseDbObj, coursesDbObj;
  if (courseID) {
    oneCourseDbObj = await basicFind(
      Course,
      {
        isById: true
      },
      courseID,
      null,
      selectVal
    );
    coursesDbObj = [oneCourseDbObj];
  } else {
    coursesDbObj = await basicFind(
      Course,
      {
        isAll: true
      },
      null,
      null,
      selectVal
    );
  }

  //logger.debug(`courses ` + JSON.stringify(coursesDbObj));

  for (let course of coursesDbObj) {
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
      logger.debug(`Loading data for locale ` + titleIntlString.locale);
      oneCourseDataCache['locale_data'][titleIntlString.locale] = {};
      objSize += sizeof(titleIntlString.locale);
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

    courseDataCache[course._id] = oneCourseDataCache;
  } // On courses

  logger.debug(`RESULT ` + JSON.stringify(courseDataCache));
  logger.debug(`RESULT Size ` + objSize);
}

async function loadCourseDeliveryCache(courseID, locale) {
  logger.debug(`In loadCourseDeliveryCache`);

  let objSize = 0;

  // Select all fields
  const selectVal = null;

  let courseDeliveryDbObj;
  if (courseID) {
    courseDeliveryDbObj = await basicFind(
      CourseDelivery,
      null,
      { course_id: courseID, locale: locale },
      null,
      selectVal
    );
  } else {
    courseDeliveryDbObj = await basicFind(
      CourseDelivery,
      {
        isAll: true
      },
      null,
      { course_id: 1 },
      selectVal
    );
  }

  logger.debug(
    `course delivery records ` + JSON.stringify(courseDeliveryDbObj)
  );

  for (let courseDeliveryRec of courseDeliveryDbObj) {
    logger.debug(
      `Loading data for course and locale ` +
        courseDeliveryRec.course_id +
        ` ` +
        courseDeliveryRec.locale
    );
    logger.debug(`course delivery rec ` + JSON.stringify(courseDeliveryRec));
    if (!courseDeliveryDataCache[courseDeliveryRec.course_id]) {
      courseDeliveryDataCache[courseDeliveryRec.course_id] = {};
    }
    courseDeliveryDataCache[courseDeliveryRec.course_id][
      courseDeliveryRec.locale
    ] = {
      ...courseDeliveryRec.toObject()
    };
    delete courseDeliveryDataCache[courseDeliveryRec.course_id][
      courseDeliveryRec.locale
    ].course_id;
    delete courseDeliveryDataCache[courseDeliveryRec.course_id][
      courseDeliveryRec.locale
    ].locale;
  }
  logger.debug(
    `   loadCourseDeliveryData RESULT ` +
      JSON.stringify(courseDeliveryDataCache)
  );
  logger.debug(`   loadCourseDeliveryData RESULT Size ` + objSize);
}

async function updateCourseDeliveryCache() {
  logger.debug(`In updateCourseDeliveryCache`);

  const courseDeliveryDbObj = await basicFind(
    CourseDelivery,
    {
      isAll: true
    },
    null,
    { course_id: 1 },
    { course_id: 1, locale: 1, updated_at: 1 }
  );

  for (let courseDeliveryRec of courseDeliveryDbObj) {
    if (
      !courseDeliveryDataCache[courseDeliveryRec.course_id] ||
      !courseDeliveryDataCache[courseDeliveryRec.course_id][
        courseDeliveryRec.locale
      ]
    ) {
      await loadCourseDeliveryCache(
        courseDeliveryRec.course_id,
        courseDeliveryRec.locale
      );
    } else {
      if (courseDeliveryRec.updated_at) {
        if (
          !courseDeliveryDataCache[courseDeliveryRec.course_id][
            courseDeliveryRec.locale
          ]['updated_at']
        ) {
          await loadCourseDeliveryCache(
            courseDeliveryRec.course_id,
            courseDeliveryRec.locale
          );
        } else if (
          courseDeliveryRec.updated_at >
          courseDeliveryDataCache[courseDeliveryRec.course_id][
            courseDeliveryRec.locale
          ]['updated_at']
        ) {
          await loadCourseDeliveryCache(
            courseDeliveryRec.course_id,
            courseDeliveryRec.locale
          );
        }
      }
    }
  } // On course - locale records
}
