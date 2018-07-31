import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const CharRangeType = new GraphQLObjectType({
  name: 'CharRange',
  description: 'Represents a range of characters using char indexes',
  fields: () => ({
    id: globalIdField('CharRange', obj => obj._id),
    start: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    end: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: charRangeConnection } = connectionDefinitions({
  name: 'CharRange',
  nodeType: CharRangeType
});
