import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const ExamType = new GraphQLObjectType({
  name: 'Exam',
  description: '',
  fields: () => ({
    id: globalIdField('Exam', obj => obj._id),
    creator_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    question_ids: {
      type: new GraphQLList(GraphQLID)
    },
    tags: {
      type: new GraphQLList(GraphQLString)
    },
    random_order: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    question_count: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    time_limit: {
      type: GraphQLInt
    },
    use_ide_test_mode: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    est_time: {
      type: GraphQLInt
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: ExamConnection } = connectionDefinitions({
  name: 'Exam',
  nodeType: ExamType
});
