import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  globalIdField
} from 'graphql-relay';

import { UnitSectionConnection, UnitSectionType } from './unit-section';
import { NodeInterface } from './node-definitions';

import { resolveUnitSections } from '../relay-resolvers/unit-section-resolvers';
import * as inputTypes from '../relay-queries/input-types';

export const CourseUnitType = new GraphQLObjectType({
  name: 'CourseUnit',
  description: 'Unit of an EXLskills course',
  fields: () => ({
    id: globalIdField('CourseUnit', obj => obj._id),
    index: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    headline: {
      type: new GraphQLNonNull(GraphQLString)
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
      description: 'Course units'
    },
    sections_list: {
      type: new GraphQLList(UnitSectionType)
    },
    final_exams: {
      type: new GraphQLList(GraphQLString)
    },
    pre_exams: {
      type: new GraphQLList(GraphQLString)
    },
    final_exam_weight_pct: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    attempts_left: {
      type: GraphQLInt
    },
    unit_processing: {
      type: GraphQLInt
    },
    ema: {
      type: GraphQLFloat
    },
    grade: {
      type: GraphQLFloat
    },
    is_continue_exam: {
      type: GraphQLBoolean
    },
    exam_attempt_id: globalIdField('ExamAttempt', obj => obj.exam_attempt_id),
    quiz_lvl: {
      type: GraphQLInt
    },
    // Begin UnitStatusPaging query
    last_attempted_at: {
      type: GraphQLString
    },
    attempts: {
      type: GraphQLInt
    },
    passed: {
      type: GraphQLBoolean
    }
    // End UnitStatusPaging query
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: CourseUnitConnection } = connectionDefinitions({
  name: 'CourseUnit',
  nodeType: CourseUnitType
});
