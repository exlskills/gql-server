import { logger } from '../../utils/logger';
import { basicFind } from '../basic-query-handler';
import CourseDelivery from '../../db-models/course-delivery-model';
import { fetchByKey } from '../user/user-fetch';
import { getStringByLocale } from '../../utils/intl-string-utils';
import { courseDeliveryDataCache } from '../../data-cache/cache-objects';

export const fetchByCourseIdAndLocale = async (
  course_id,
  locale,
  selectVal
) => {
  logger.debug(`In fetchByCourseIdAndLocale`);
  let record;
  try {
    record = await basicFind(
      CourseDelivery,
      { isOne: true },
      { course_id: course_id, locale: locale },
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

/*
Returns ONE (active) Schedule that is applicable to ANY of the Delivery Methods passed in
Start Dates sorted in ascending order (earliest to latest), equal or later to the date passed in
NOTE: this assumes a single Delivery Structure and Schedule Owner per applicable content (course_is, locale)
 */
export const fetchCourseDeliverySchedule = async (
  course_id,
  delivery_methods,
  date_on_or_after,
  viewer,
  info
) => {
  logger.debug(`in fetchCourseDeliverySchedule`);
  // logger.debug(`   course_id ` + course_id);
  const selectVal = {
    instructors: 1,
    delivery_structures: 1
  };
  let courseDeliveryRecord = await fetchByCourseIdAndLocale(
    course_id,
    viewer.locale,
    selectVal
  );
  logger.debug(` courseDeliveryRecord ` + courseDeliveryRecord);

  if (!(courseDeliveryRecord && courseDeliveryRecord.delivery_structures)) {
    return {};
  }

  let result = {};

  const courseInstructors =
    courseDeliveryRecord.instructors &&
    courseDeliveryRecord.instructors.length > 0
      ? courseDeliveryRecord.instructors
      : [];

  for (let deliveryStruct of courseDeliveryRecord.delivery_structures) {
    if (
      !delivery_methods.some(r => deliveryStruct.delivery_methods.includes(r))
    ) {
      continue;
    }
    result._id = deliveryStruct._id;
    result.delivery_methods = deliveryStruct.delivery_methods;
    result.delivery_structure = deliveryStruct.delivery_structure;
    result.course_duration = loadDuration(deliveryStruct.course_duration);
    result.course_notes = deliveryStruct.course_notes
      ? deliveryStruct.course_notes
      : '';

    let deliveryStructInstructors =
      deliveryStruct.instructors && deliveryStruct.instructors.length > 0
        ? deliveryStruct.instructors
        : courseInstructors;

    const genSessionDuration = loadDuration(deliveryStruct.session_duration);

    const session_info = [];
    for (let deliverySession of deliveryStruct.sessions) {
      deliverySession.session_duration = isDuration(
        deliverySession.session_duration
      )
        ? loadDuration(deliverySession.session_duration)
        : genSessionDuration;

      deliverySession.session_notes = deliverySession.session_notes
        ? deliverySession.session_notes
        : '';

      session_info.push(deliverySession);
    }

    result.session_info = session_info;

    const scheduled_runs = [];
    const sortedScheduledRuns = deliveryStruct.scheduled_runs.sort(
      (it1, it2) => it1.run_start_date - it2.run_start_date
    );
    for (let scheduledRun of sortedScheduledRuns) {
      if (!scheduledRun.active) {
        continue;
      }
      if (scheduledRun.run_start_date < date_on_or_after) {
        continue;
      }

      let scheduledRunInstructors =
        scheduledRun.instructors && scheduledRun.instructors.length > 0
          ? scheduledRun.instructors
          : deliveryStructInstructors;

      scheduledRun.offered_at_price =
        scheduledRun.offered_at_price &&
        scheduledRun.offered_at_price.amount &&
        scheduledRun.offered_at_price.amount > 0
          ? scheduledRun.offered_at_price
          : deliveryStruct.list_price;

      const instructorObjArray = [];
      const run_sessions = [];
      const sortedSchedRunSessions = scheduledRun.sessions.sort(
        (it1, it2) => it1.session_seq - it2.session_seq
      );
      for (let schedRunSession of sortedSchedRunSessions) {
        logger.debug(` schedRunSession ` + JSON.stringify(schedRunSession));

        const thisSessionInfo = session_info.find(
          obj => obj.session_seq === schedRunSession.session_seq
        );
        logger.debug(` thisSessionInfo ` + JSON.stringify(thisSessionInfo));

        if (
          !(
            schedRunSession.instructors &&
            schedRunSession.instructors.length > 0
          )
        ) {
          schedRunSession.instructors =
            thisSessionInfo &&
            thisSessionInfo.instructors &&
            thisSessionInfo.instructors.length > 0
              ? thisSessionInfo.instructors
              : scheduledRunInstructors;
        }

        if (!isDuration(schedRunSession.session_duration)) {
          schedRunSession.session_duration = thisSessionInfo
            ? thisSessionInfo.session_duration
            : genSessionDuration;
        }
        logger.debug(
          ` schedRunSession updated ` + JSON.stringify(schedRunSession)
        );

        const sessionInstructors = [];
        for (let instructorId of schedRunSession.instructors) {
          const thisInstructor = instructorObjArray.find(
            obj => obj.username === instructorId
          );
          if (thisInstructor) {
            sessionInstructors.push(thisInstructor);
          } else {
            const instrObj = {
              _id: instructorId,
              username: instructorId,
              full_name: '',
              avatar_url: '',
              headline: '',
              biography: ''
            };
            const fetchedInstr = await fetchByKey(
              { username: instructorId },
              {
                _id: 1,
                full_name: 1,
                avatar_url: 1,
                headline: 1,
                biography: 1
              },
              viewer,
              info
            );
            if (fetchedInstr && fetchedInstr.full_name) {
              logger.debug(` fetchedInstr ` + fetchedInstr);
              instrObj.full_name = getStringByLocale(
                fetchedInstr.full_name,
                viewer.locale
              ).text;
            }
            instrObj.avatar_url =
              fetchedInstr && fetchedInstr.avatar_url
                ? fetchedInstr.avatar_url
                : instrObj.avatar_url;
            instrObj._id =
              fetchedInstr && fetchedInstr.id ? fetchedInstr._id : instrObj._id;

            if (fetchedInstr && fetchedInstr.headline) {
              instrObj.headline = getStringByLocale(
                fetchedInstr.headline,
                viewer.locale
              ).text;
            }
            if (fetchedInstr && fetchedInstr.biography) {
              instrObj.biography = getStringByLocale(
                fetchedInstr.biography,
                viewer.locale
              ).text;
            }

            logger.debug(` instrObj ` + JSON.stringify(instrObj));
            sessionInstructors.push(instrObj);
            instructorObjArray.push(instrObj);
          }
        }

        const session_run_output = {
          _id: schedRunSession._id,
          session_seq: schedRunSession.session_seq,
          session_start_date: schedRunSession.session_start_date,
          instructors: sessionInstructors,
          session_duration: schedRunSession.session_duration,
          session_run_notes: schedRunSession.session_run_notes
            ? schedRunSession.session_run_notes
            : ''
        };

        run_sessions.push(session_run_output);
      }

      scheduledRun.run_sessions = run_sessions;
      scheduled_runs.push(scheduledRun);
    }

    result.scheduled_runs = scheduled_runs;
  }
  logger.debug(` fetchCourseDeliverySchedule result ` + JSON.stringify(result));
  return result;
};

export const fetchCourseDeliveryMethodsFromCache = async (
  course_id,
  viewer,
  info
) => {
  // logger.debug(`in fetchCourseDeliveryMethodsFromCache`);

  let result = [];
  if (
    courseDeliveryDataCache[course_id] &&
    courseDeliveryDataCache[course_id][viewer.locale] &&
    courseDeliveryDataCache[course_id][viewer.locale].available_delivery_methods
  ) {
    result =
      courseDeliveryDataCache[course_id][viewer.locale]
        .available_delivery_methods;
  }

  logger.debug(`    fetchCourseDeliveryMethodsFromCache result ` + result);
  return result;
};

const loadDuration = s => {
  const result = {
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0
  };
  if (s) {
    if (s.months) {
      result.months = s.months;
    }
    if (s.weeks) {
      result.weeks = s.weeks;
    }
    if (s.days) {
      result.days = s.days;
    }
    if (s.hours) {
      result.hours = s.hours;
    }
    if (s.minutes) {
      result.minutes = s.minutes;
    }
  }
  return result;
};

const isDuration = s => {
  if (s && (s.months || s.weeks || s.days || s.hours || s.minutes)) {
    return true;
  }
  return false;
};
