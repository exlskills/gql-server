import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { connectionDefinitions } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const CardActionType = new GraphQLObjectType({
  name: 'CardAction',
  description: 'Keeps track of user interactions with course cards',
  fields: () => ({
    cardAction: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: CardActionConnection } = connectionDefinitions({
  name: 'CardAction',
  nodeType: CardActionType
});
