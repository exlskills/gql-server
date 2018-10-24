import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';

export const ListDefType = new GraphQLObjectType({
  name: 'ListDef',
  description: '',
  fields: () => ({
    id: globalIdField('ListDef', obj => obj._id),
    type: {
      type: new GraphQLNonNull(GraphQLString)
    },
    value: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: ListDefConnection } = connectionDefinitions({
  name: 'ListDef',
  nodeType: ListDefType
});
