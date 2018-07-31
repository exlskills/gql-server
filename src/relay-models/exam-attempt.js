import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const ExamAttemptType = new GraphQLObjectType({
  name: 'ExamAttempt',
  description: 'ExamAttempt',
  fields: () => ({
    id: globalIdField('ExamAttempt', obj => obj._id),
    exam_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    user_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    course_unit_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    question_ids: {
      type: new GraphQLList(GraphQLID)
    },
    question_interaction_ids: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLID))
    },
    started_at: {
      type: GraphQLString
    },
    is_active: {
      type: GraphQLBoolean
    },
    submitted_at: {
      type: GraphQLString
    },
    time_limit_exceeded: {
      type: GraphQLBoolean
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: ExamAttemptConnection } = connectionDefinitions({
  name: 'ExamAttempt',
  nodeType: ExamAttemptType
});
