import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  globalIdField
} from 'graphql-relay';

import { UnitSectionConnection, UnitSectionType } from './unit-section-type';
import { NodeInterface } from './node-definitions-type';

import { resolveUnitSections } from '../relay-resolvers/unit-section-resolver';
import * as inputTypes from '../relay-queries/input-types-get-query';

export const CourseUnitType = new GraphQLObjectType({
  name: 'CourseUnit',
  description: 'Unit of an EXLskills course',
  fields: () => ({
    id: globalIdField('CourseUnit', obj => obj._id),
    index: {
      type: GraphQLInt
    },
    title: {
      type: GraphQLString
    },
    headline: {
      type: GraphQLString
    },
    sections: {
      type: UnitSectionConnection,
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
        resolveUnitSections(obj, args, viewer, info),
      description: 'Units sections'
    },
    sections_list: {
      type: new GraphQLList(UnitSectionType)
    },
    has_exam: {
      type: GraphQLBoolean
    },
    final_exam_weight_pct: {
      type: GraphQLFloat
    },
    attempts_left: {
      type: GraphQLInt
    },
    unit_progress_state: {
      type: GraphQLInt
    },
    ema: {
      type: GraphQLFloat
    },
    grade: {
      type: GraphQLFloat
    },
    // TODO remove this when spf is updated
    is_continue_exam: {
      type: GraphQLBoolean
    },
    // TODO this is not mapped anymore as being renamed to exam_session_id
    exam_attempt_id: {
      type: GraphQLString
    },
    exam_session_id: globalIdField('ExamSession', obj => obj.exam_session_id),
    last_attempted_at: {
      type: GraphQLString
    },
    attempts: {
      type: GraphQLInt
    },
    passed: {
      type: GraphQLBoolean
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: CourseUnitConnection } = connectionDefinitions({
  name: 'CourseUnit',
  nodeType: CourseUnitType
});
