import {
  connectionFromDataSource,
  attachEmptyFrame
} from '../paging-processor/connection-from-datasource';
import * as UserFetch from '../db-handlers/user/user-fetch';
import {
  fetchCourses,
  fetchCourseUnitWithSummary,
  fetchCourseEntry
} from '../db-handlers/course/course-fetch';
import {
  fetchCourseUnits,
  fetchUnitStatus
} from '../db-handlers/course/course-unit-fetch';
import { fetchUnitSections } from '../db-handlers/course/unit-section-fetch';
import * as SectionCardFetch from '../db-handlers/course/section-card-fetch';
import { fetchUnit } from '../db-handlers/course/unit-spec-fetch';
import { fromGlobalId, toGlobalId } from 'graphql-relay';
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
  const businessKey = '_id';
  const fetchParameters = {};

  if (args.resolverArgs) {
    const listType = args.resolverArgs.find(e => e.param == 'list');
    if (listType) {
      if (listType.value == 'mine') {
        fetchParameters.userId = viewer.user_id;
        fetchParameters.mine = true;

        // get the courses IDs from the UserCourseRole of the current user
        const user = await UserFetch.findById(viewer.user_id, viewer, info);
        fetchParameters.courseIds = user
          ? user.course_roles.map(item => item.course_id)
          : [];

        // roles of the user on the enrolled courses
        const courseRoles = args.resolverArgs.find(e => e.param == 'roles');
        // TODO: what if no roles given? fetch all for the moment
        fetchParameters.roles = courseRoles ? courseRoles.value : null;
      } else if (listType.value == 'relevant') {
        // to show Enrolled courses first, then all other courses
        fetchParameters.userId = viewer.user_id;
        fetchParameters.relevant = true;
      } else if (listType.value == 'trending') {
        // to sort by the enrolled count
        fetchParameters.trending = true;
      } else {
        return attachEmptyFrame();
      }
    }

    const topicType = args.resolverArgs.find(e => e.param == 'topic');
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

export const resolveCourseEntry = async (obj, args, viewer, info) => {
  try {
    let course_id = fromGlobalId(args.course_id).id;
    let result = await fetchCourseEntry(course_id, viewer, info);
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

export const resolveCourseUnitSummary = async (obj, args, viewer, info) => {
  try {
    let course_id = fromGlobalId(args.course_id).id;
    return await fetchCourseUnitWithSummary(course_id, viewer, info);
  } catch (errInternalAllreadyReported) {
    return {};
  }
};

export const resolveCourseUnits = (obj, args, viewer, info) => {
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

export const resolveUnitEntry = async (obj, args, viewer, info) => {
  const courseId = fromGlobalId(args.course_id).id;
  const unitId = fromGlobalId(args.unit_id).id;
  return await fetchUnit(unitId, courseId, viewer.user_id, viewer);
};

export const resolveUnitStatus = (obj, args, viewer, info) => {
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
    queryFunction: fetchUnitStatus,
    businessKey: '_id',
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

export const resolveUnitSections = (obj, args, viewer, info) => {
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

export const resolveSectionCards = (obj, args, viewer, info) => {
  if (!args || !args.resolverArgs) {
    return attachEmptyFrame();
  }

  const courseParam = args.resolverArgs.find(e => e.param === 'course_id');
  const unitParam = args.resolverArgs.find(e => e.param === 'unit_id');
  const sectionParam = args.resolverArgs.find(e => e.param === 'section_id');

  if (!courseParam || !unitParam || !sectionParam) {
    return attachEmptyFrame();
  }

  let fetchParameters = {
    userId: viewer.user_id,
    courseId: fromGlobalId(courseParam.value).id,
    unitId: fromGlobalId(unitParam.value).id,
    sectionId: fromGlobalId(sectionParam.value).id
  };

  const cardParam = args.resolverArgs.find(e => e.param === 'card_id');
  if (cardParam) {
    fetchParameters.cardId = fromGlobalId(cardParam.value).id;
  }

  const versionParam = args.resolverArgs.find(e => e.param === 'version');
  if (versionParam) {
    fetchParameters.version = versionParam.value;
  }

  const execDetails = {
    queryFunction: SectionCardFetch.fetchSectionCards,
    businessKey: '_id',
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

export const resolveCardEntry = async (obj, args, viewer, info) => {
  const businessKey = '_id';
  const fetchParameters = {};
  if (obj) {
    fetchParameters.courseId = obj.currentCourseId;
    fetchParameters.unitId = obj.currentUnitId;
    fetchParameters.sectionId = obj.currentSectionId;
    fetchParameters.cardId = obj._id;
  } else {
    if (args.course_id && args.unit_id && args.section_id && args.card_id) {
      fetchParameters.courseId = fromGlobalId(args.course_id).id;
      fetchParameters.unitId = fromGlobalId(args.unit_id).id;
      fetchParameters.sectionId = fromGlobalId(args.section_id).id;
      fetchParameters.cardId = fromGlobalId(args.card_id).id;
    } else {
      return Promise.reject('invalid args');
    }
  }

  // filterValues, aggregateArray, viewerLocale, fetchParameters
  const aggregateArray = [
    {
      $limit: 1
    }
  ];
  const result = await SectionCardFetch.fetchSectionCards(
    {},
    aggregateArray,
    viewer.locale,
    fetchParameters
  );
  return result && result.length == 1 ? result[0] : {};
};

export const resolveCardByQuestion = async (obj, args, viewer, info) => {
  const questionId = fromGlobalId(args.question_id).id;
  return await SectionCardFetch.fetchCardByQuestionId(
    questionId,
    viewer.locale
  );
};
