import { logger } from '../../utils/logger';
import { basicFind } from '../basic-query-handler';
import CourseDelivery from '../../db-models/course-delivery-model';

export const fetchByCourseIdAndLocale = async (
  course_id,
  locale,
  selectVal
) => {
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
Returns ONE Schedule that is applicable to ANY of the Delivery Methods passed in; active OR inactive
Start Dates sorted in ascending order (earliest to latest), equal or later to the date passed in
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
  // logger.debug(` courseInstructors ` + courseInstructors);

  for (let deliveryStruct of courseDeliveryRecord.delivery_structures) {
    if (
      !delivery_methods.some(r => deliveryStruct.delivery_methods.includes(r))
    ) {
      continue;
    }
    result.delivery_methods = deliveryStruct.delivery_methods;
    result.delivery_structure = deliveryStruct.delivery_structure;
    result.combined_duration = loadDuration(deliveryStruct.combined_duration);

    let deliveryStructInstructors =
      deliveryStruct.instructors && deliveryStruct.instructors.length > 0
        ? deliveryStruct.instructors
        : courseInstructors;
    // logger.debug(` deliveryStructInstructors ` + deliveryStructInstructors);

    const genSessionDuration = loadDuration(deliveryStruct.session_duration);

    const session_info = [];
    for (let deliverySession of deliveryStruct.sessions) {
      deliverySession.session_duration = deliverySession.session_duration
        ? loadDuration(deliverySession.session_duration)
        : genSessionDuration;

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
      // logger.debug(` scheduledRunInstructors ` + scheduledRunInstructors);

      const run_sessions = [];
      const sortedSchedRunSessions = scheduledRun.sessions.sort(
        (it1, it2) => it1.session_seq - it2.session_seq
      );
      for (let schedRunSession of sortedSchedRunSessions) {
        logger.debug(` schedRunSession ` + JSON.stringify(schedRunSession));

        const schedSessionObj = {};

        const thisSessionInfo = session_info.find(
          obj => obj.session_seq === schedRunSession.session_seq
        );

        logger.debug(` thisSessionInfo ` + JSON.stringify(thisSessionInfo));

        if (
          schedRunSession.instructors &&
          schedRunSession.instructors.length > 0
        ) {
          schedSessionObj.instructors = schedRunSession.instructors;
        } else {
          if (
            thisSessionInfo &&
            thisSessionInfo.instructors &&
            thisSessionInfo.instructors.length > 0
          ) {
            schedSessionObj.instructors = thisSessionInfo.instructors;
          } else {
            schedSessionObj.instructors = scheduledRunInstructors;
          }
        }
        if (schedRunSession.session_duration) {
          schedSessionObj.session_duration = schedRunSession.session_duration;
        } else {
          schedSessionObj.session_duration = thisSessionInfo.session_duration;
        }

        logger.debug(
          ` schedRunSession updated ` + JSON.stringify(schedSessionObj)
        );
        run_sessions.push(schedSessionObj);
      }
      scheduledRun.run_sessions = run_sessions;
      scheduled_runs.push(scheduledRun);
    }

    result.scheduled_runs = scheduled_runs;
  }
  logger.debug(` result ` + result);
  return result;
};

export const fetchCourseDeliveryMethods = async (course_id, viewer, info) => {
  logger.debug(`in fetchCourseDeliverySchedule`);
  logger.debug(` result ` + result);
  let result = [];
  const selectVal = {
    available_delivery_methods: 1
  };
  let courseDeliveryRecord = await fetchByCourseIdAndLocale(
    course_id,
    viewer.locale,
    selectVal
  );
  if (courseDeliveryRecord && courseDeliveryRecord.available_delivery_methods) {
    result = courseDeliveryRecord.available_delivery_methods;
  }
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
