import {
  connectionFromDataSource,
  attachEmptyFrame
} from '../paging-processor/connection-from-datasource';
import * as UserFetch from '../db-handlers/user/user-fetch';
import {
  fetchCourses,
  fetchCourseAndCardInteraction
} from '../db-handlers/course/course-fetch';
import { fromGlobalId, toGlobalId } from 'graphql-relay';
import { logger } from '../utils/logger';

/**
 * Resolve function for CoursePaging query
 * @param {any} obj Not used for the moment
 * @param {object} args GraphQL Arguments
 *   {object} filterValues: A free-form string to be used as a MDB expression in the $match operation
 *     {string} filterValuesString: the expression in JSON format
 *   {array} resolverArgs: List of {param, value} objects to filter the courses list
 *     list: Has one of these values: `mine`, `relevant` and `trending`
 *     roles: List of roles to filter the enrolled courses. Only when the `list` param is `mine`
 *     topic: Topic value to filter out the courses
 * @param {object} viewer Contextual information. Including logged in user data
 * @param {object} info Containing information about the execution info
 * @return {object} Paging object
 */
export const resolveCourses = async (obj, args, viewer, info) => {
  logger.debug(`in resolveCourses`);
  const businessKey = '_id';
  const fetchParameters = {};

  if (args.resolverArgs) {
    const listType = args.resolverArgs.find(e => e.param === 'list');
    if (listType) {
      if (listType.value === 'mine') {
        fetchParameters.userId = viewer.user_id;
        fetchParameters.mine = true;
        /*
        // get the courses IDs from the UserCourseRole of the current user
        const user = await UserFetch.fetchById(viewer.user_id, viewer, info);
        fetchParameters.courseIds = user
          ? user.course_roles.map(item => item.course_id)
          : [];
        // roles of the user on the enrolled courses
        const courseRoles = args.resolverArgs.find(e => e.param === 'roles');
        fetchParameters.roles = courseRoles ? courseRoles.value : null;
        */
      } else if (listType.value === 'relevant') {
        // to show Enrolled courses first, then all other courses
        fetchParameters.userId = viewer.user_id;
        fetchParameters.relevant = true;
      } else if (listType.value === 'trending') {
        // to sort by the enrolled count
        fetchParameters.trending = true;
      } else {
        return attachEmptyFrame();
      }
    }

    const topicType = args.resolverArgs.find(e => e.param === 'topic');
    if (topicType) {
      fetchParameters.topic = topicType.value;
    }
  }

  const execDetails = {
    queryFunction: fetchCourses,
    businessKey: businessKey,
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

export const resolveCourseById = async (obj, args, viewer, info) => {
  logger.debug(`in resolveCourseById`);
  logger.debug(`   obj ` + JSON.stringify(obj));
  logger.debug(`   args ` + JSON.stringify(args));
  try {
    let course_id = fromGlobalId(args.course_id).id;
    let result = await fetchCourseAndCardInteraction(course_id, viewer, info);
    if (result && result.last_accessed_unit) {
      result.last_accessed_unit = toGlobalId(
        'CourseUnit',
        result.last_accessed_unit
      );
    }
    if (result && result.last_accessed_section) {
      result.last_accessed_section = toGlobalId(
        'UnitSection',
        result.last_accessed_section
      );
    }
    if (result && result.last_accessed_card) {
      result.last_accessed_card = toGlobalId(
        'SectionCard',
        result.last_accessed_card
      );
    }
    return result;
  } catch (err) {
    return Promise.reject(err);
  }
};
