import { logger } from '../../utils/logger';
import { basicFind } from '../basic-query-handler';
import CourseDelivery from '../../db-models/course-delivery-model';

export const fetchByCourseId = async (course_id, locale, selectVal) => {
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
  active,
  date_on_or_after,
  viewer,
  info
) => {
  logger.debug(`in fetchCourseDeliverySchedule`);
  // logger.debug(`   course_id ` + course_id);
  const selectVal = {
    delivery_schedule: 1
  };
  let courseDeliveryRecord = await fetchByCourseId(
    course_id,
    viewer.locale,
    selectVal
  );
  logger.debug(` courseDeliveryRecord ` + courseDeliveryRecord);
  let result = {};
  if (courseDeliveryRecord && courseDeliveryRecord.delivery_schedule) {
    for (let schedule of courseDeliveryRecord.delivery_schedule) {
      if ((active && !schedule.active) || (!active && schedule.active)) {
        continue;
      }
      if (!delivery_methods.some(r => schedule.delivery_methods.includes(r))) {
        continue;
      }
      logger.debug(
        ` schedule.scheduled_event_details ` + schedule.scheduled_event_details
      );
      result.active = schedule.active;
      result.delivery_methods = schedule.delivery_methods;
      result.event_duration = {
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0
      };
      if (schedule.event_duration) {
        if (schedule.event_duration.months) {
          result.event_duration.months = schedule.event_duration.months;
        }
        if (schedule.event_duration.weeks) {
          result.event_duration.weeks = schedule.event_duration.weeks;
        }
        if (schedule.event_duration.days) {
          result.event_duration.days = schedule.event_duration.days;
        }
        if (schedule.event_duration.hours) {
          result.event_duration.hours = schedule.event_duration.hours;
        }
        if (schedule.event_duration.minutes) {
          result.event_duration.minutes = schedule.event_duration.minutes;
        }
      }
      result.scheduled_event_details = [];
      const sortedScheduleDetails = schedule.scheduled_event_details.sort(
        (it1, it2) => it1.event_start_date - it2.event_start_date
      );
      for (let event of sortedScheduleDetails) {
        if (event.event_start_date < date_on_or_after) {
          continue;
        }
        result.scheduled_event_details.push(event);
      }
    }
  }
  logger.debug(` result ` + result);
  return result;
};

export const fetchCourseDeliveryMethods = async (course_id, viewer, info) => {
  logger.debug(`in fetchCourseDeliverySchedule`);
  logger.debug(` result ` + result);
  let result = [];
  const selectVal = {
    delivery_methods: 1
  };
  let courseDeliveryRecord = await fetchByCourseId(
    course_id,
    viewer.locale,
    selectVal
  );
  if (courseDeliveryRecord && courseDeliveryRecord.delivery_methods) {
    result = courseDeliveryRecord.delivery_methods;
  }
  return result;
};
