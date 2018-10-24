import { connectionArgs } from 'graphql-relay';

import * as inputTypes from '../input-types-get-query';

import {
  CourseConnection,
  CourseUnitConnection,
  SectionCardConnection,
  UnitSectionConnection
} from '../../relay-models';

import { resolveListCourses } from '../../relay-resolvers/course-resolver';
import {
  resolveCourseUnits,
  resolveUserCourseUnitExamStatus
} from '../../relay-resolvers/course-unit-resolver';
import { resolveUnitSections } from '../../relay-resolvers/unit-section-resolver';
import { resolveSectionCards } from '../../relay-resolvers/section-card-resolver';

export const listCourses = {
  type: CourseConnection,
  description: 'all Courses in the database',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) => resolveListCourses(obj, args, viewer, info)
};

export const listUnits = {
  type: CourseUnitConnection,
  description: 'all Units in the course',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) =>
    resolveCourseUnits(obj, args, viewer, info)
};

export const userCourseUnitExamStatusPaging = {
  type: CourseUnitConnection,
  description: 'User exam status for Course',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) =>
    resolveUserCourseUnitExamStatus(obj, args, viewer, info)
};

export const listSections = {
  type: UnitSectionConnection,
  description: 'all Sections in the Unit',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) =>
    resolveUnitSections(obj, args, viewer, info)
};

export const listCards = {
  type: SectionCardConnection,
  description: 'all Cards in the Section',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) =>
    resolveSectionCards(obj, args, viewer, info)
};
