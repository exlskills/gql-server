import { logger } from '../utils/logger';
import { fromGlobalId } from 'graphql-relay';
import {
  fetchCourseDeliveryMethods,
  fetchCourseDeliverySchedule
} from '../db-handlers/course/course-delivery-schedule-fetch';
import { fetchByUserAndItemRefId } from '../db-handlers/user/user-order-handler';
import {
  ITEM_CATEGORY_COURSE_CERTIFICATE,
  ITEM_CATEGORY_COURSE_RUN
} from '../db-models/order-item-model';

export const resolveCourseDeliverySchedule = async (
  obj,
  args,
  viewer,
  info
) => {
  logger.debug(`in resolveCourseDeliverySchedule`);
  // logger.debug(`   obj ` + JSON.stringify(obj));
  logger.debug(`   args ` + JSON.stringify(args));
  try {
    let courseId = fromGlobalId(args.course_id).id;
    let delivery_methods = ['live'];
    if (args.delivery_method) {
      delivery_methods = [];
      delivery_methods.push(args.delivery_method);
    }
    let date_on_or_after = new Date(Date.UTC(1970, 1, 1));
    if (args.date_on_or_after) {
      date_on_or_after = args.date_on_or_after;
    }
    let result = await fetchCourseDeliverySchedule(
      courseId,
      delivery_methods,
      date_on_or_after,
      viewer,
      info
    );

    return result;
  } catch (err) {
    return Promise.reject(err);
  }
};

export const resolveCourseDeliveryMethods = async (obj, args, viewer, info) => {
  // logger.debug(`in resolveCourseDeliveryMethods`);
  try {
    let courseId;
    if (args.course_id) {
      courseId = fromGlobalId(args.course_id).id;
    } else {
      courseId = obj._id;
    }
    let result = await fetchCourseDeliveryMethods(courseId, viewer, info);
    return result;
  } catch (err) {
    return Promise.reject(err);
  }
};

export const resolveUserSeatPurchased = async (obj, args, viewer, info) => {
  logger.debug(`in resolveUserSeatPurchased`);
  logger.debug(`   obj ` + JSON.stringify(obj));
  const seatPurchased = await fetchByUserAndItemRefId(
    viewer.user_id,
    ITEM_CATEGORY_COURSE_RUN,
    obj._id
  );
  return seatPurchased ? true : false;
};
