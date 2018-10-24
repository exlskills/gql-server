import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';

export const QuestionFreeResponseDataType = new GraphQLObjectType({
  name: 'QuestionFreeResponseData',
  description: 'Question data for the `free_response` question type',
  fields: () => ({
    id: globalIdField('QuestionFreeResponseData', obj => obj._id),
    tmpl_files: {
      type: new GraphQLNonNull(GraphQLString)
    },
    grading_tests: {
      type: new GraphQLNonNull(GraphQLString)
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
    src_files: {
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
