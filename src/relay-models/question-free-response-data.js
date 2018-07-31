import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const QuestionFreeResponseDataType = new GraphQLObjectType({
  name: 'QuestionFreeResponseData',
  description: 'Question data for the `free_response` question type',
  fields: () => ({
    id: globalIdField('QuestionFreeResponseData', obj => obj._id),
    code: {
      type: new GraphQLNonNull(GraphQLString)
    },
    code_tags: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLString)) // TODO: needs testing
    },
    environment_key: {
      type: new GraphQLNonNull(GraphQLString)
    },
    use_advanced_features: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    explanation: {
      type: new GraphQLNonNull(GraphQLString)
    },
    validation_code: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: QuestionFreeResponseDataConnection
} = connectionDefinitions({
  name: 'QuestionFreeResponseData',
  nodeType: QuestionFreeResponseDataType
});
