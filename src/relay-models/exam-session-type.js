import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';

export const ExamSessionType = new GraphQLObjectType({
  name: 'ExamSession',
  description: 'ExamSession',
  fields: () => ({
    id: globalIdField('ExamSession', obj => obj._id),
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
  name: 'ExamSession',
  nodeType: ExamSessionType
});
