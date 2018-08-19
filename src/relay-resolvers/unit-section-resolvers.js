import { logger } from '../utils/logger';
import { fetchUnitSections } from '../db-handlers/course/unit-section-fetch';
import { connectionFromDataSource } from '../paging-processor/connection-from-datasource';

export const resolveUnitSections = (obj, args, viewer, info) => {
  logger.debug(`in resolveUnitSections`);
  const businessKey = '_id';
  const fetchParameters = {
    userId: viewer.user_id
  };
  if (obj) {
    fetchParameters.courseId = obj.currentCourseId;
    fetchParameters.unitId = obj._id;
  } else {
    if (args.resolverArgs) {
      fetchParameters.courseId = args.resolverArgs.find(
        e => e.param === 'course_id'
      ).value;
      fetchParameters.unitId = args.resolverArgs.find(
        e => e.param === 'unit_id'
      ).value;
      if (args.resolverArgs.find(e => e.param === 'section_id')) {
        fetchParameters.sectionId = args.resolverArgs.find(
          e => e.param === 'section_id'
        ).value;
      }
    } else {
      return Promise.reject('Invalid args');
    }
  }

  const execDetails = {
    queryFunction: fetchUnitSections,
    businessKey: businessKey,
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};
