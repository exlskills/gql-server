import { logger } from '../utils/logger';
import { fetchUnitSections } from '../db-handlers/course/unit-section-fetch';
import {
  attachEmptyFrame,
  connectionFromDataSource
} from '../paging-processor/connection-from-datasource';
import { fromGlobalId } from 'graphql-relay';

export const resolveUnitSections = (obj, args, viewer, info) => {
  logger.debug(`in resolveUnitSections`);

  if (!args || !args.resolverArgs) {
    return attachEmptyFrame();
  }

  const fetchParameters = {
    userId: viewer.user_id
  };
  if (obj) {
    // May need to convert from Global ID
    fetchParameters.courseId = obj.currentCourseId;
    fetchParameters.unitId = obj._id;
  } else {
    if (args.resolverArgs) {
      fetchParameters.courseId = fromGlobalId(
        args.resolverArgs.find(e => e.param === 'course_id').value
      ).id;
      fetchParameters.unitId = fromGlobalId(
        args.resolverArgs.find(e => e.param === 'unit_id').value
      ).id;
      if (args.resolverArgs.find(e => e.param === 'section_id')) {
        fetchParameters.sectionId = fromGlobalId(
          args.resolverArgs.find(e => e.param === 'section_id').value
        ).id;
      }
    } else {
      return Promise.reject('Invalid args');
    }
  }

  const execDetails = {
    queryFunction: fetchUnitSections,
    businessKey: '_id',
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};
