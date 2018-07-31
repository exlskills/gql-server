import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const QuestionMultipleDataType = new GraphQLObjectType({
  name: 'QuestionMultipleData',
  description:
    'Question data for the `multiple_choice_single` and `multiple_choice_many` question types',
  fields: () => ({
    id: globalIdField('QuestionMultipleData', obj => obj._id),
    seq: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    explanation: {
      type: new GraphQLNonNull(GraphQLString)
    },
    is_answer: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    text: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: QuestionMultipleDataConnection
} = connectionDefinitions({
  name: 'QuestionMultipleData',
  nodeType: QuestionMultipleDataType
});
