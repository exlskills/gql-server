import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const QuestionInteractionType = new GraphQLObjectType({
  name: 'QuestionInteraction',
  description: '',
  fields: () => ({
    id: globalIdField('QuestionInteraction', obj => obj._id),
    question_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    user_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    result: {
      type: new GraphQLNonNull(GraphQLString)
    },
    duration_sec: {
      type: GraphQLInt
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: QuestionInteractionConnection
} = connectionDefinitions({
  name: 'QuestionInteraction',
  nodeType: QuestionInteractionType
});
