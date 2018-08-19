import { logger } from '../utils/logger';
import { fromGlobalId } from 'graphql-relay';
import {
  attachEmptyFrame,
  connectionFromDataSource
} from '../paging-processor/connection-from-datasource';
import {
  fetchCourseUnitById,
  fetchCourseUnits,
  fetchUserCourseUnitExamStatus,
  fetchUserCourseExamAttemptsByUnit
} from '../db-handlers/course/course-unit-fetch';

export const resolveCourseUnits = (obj, args, viewer, info) => {
  logger.debug(`in resolveCourseUnits`);
  const businessKey = '_id';
  const fetchParameters = {
    userId: viewer.user_id
  };

  if (obj) {
    fetchParameters.courseId = obj._id;
  } else if (args.resolverArgs) {
    const courseParam = args.resolverArgs.find(e => e.param === 'course_id');
    fetchParameters.courseId = courseParam
      ? fromGlobalId(courseParam.value).id
      : '';

    const unitParam = args.resolverArgs.find(e => e.param === 'unit_id');
    fetchParameters.unitId = unitParam
      ? fromGlobalId(unitParam.value).id
      : null;
  } else {
    return attachEmptyFrame();
  }

  const execDetails = {
    queryFunction: fetchCourseUnits,
    businessKey: businessKey,
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

export const resolveCourseUnit = async (obj, args, viewer, info) => {
  logger.debug(`in resolveUnitEntry`);
  const courseId = fromGlobalId(args.course_id).id;
  const unitId = fromGlobalId(args.unit_id).id;
  return await fetchCourseUnitById(unitId, courseId, viewer.user_id, viewer);
};

export const resolveUserCourseExamAttempts = async (
  obj,
  args,
  viewer,
  info
) => {
  logger.debug(`in resolveUserCourseUnitExamAttempts`);
  try {
    let course_id = fromGlobalId(args.course_id).id;
    return await fetchUserCourseExamAttemptsByUnit(course_id, viewer, info);
  } catch (errInternalAllreadyReported) {
    return {};
  }
};

export const resolveUserCourseUnitExamStatus = (obj, args, viewer, info) => {
  logger.debug(`in resolveUserCourseUnitExamStatus`);
  if (!args || !args.resolverArgs) {
    return attachEmptyFrame();
  }

  const courseParam = args.resolverArgs.find(e => e.param === 'course_id');
  if (!courseParam) {
    return attachEmptyFrame();
  }

  let fetchParameters = {
    userId: viewer.user_id,
    courseId: fromGlobalId(courseParam.value).id
  };

  const execDetails = {
    queryFunction: fetchUserCourseUnitExamStatus,
    businessKey: '_id',
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};
