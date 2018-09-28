import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const AuthStrategyType = new GraphQLObjectType({
  name: 'AuthStrategy',
  description:
    'Authentication strategy object, provides a flexible structure for various auth methods',
  fields: () => ({
    id: globalIdField('AuthStrategy', obj => obj._id),
    auth_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    email: {
      type: GraphQLString
    },
    method: {
      type: new GraphQLNonNull(GraphQLString)
    },
    version: {
      type: new GraphQLNonNull(GraphQLString) //semver
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: AuthStrategyConnection } = connectionDefinitions(
  { name: 'AuthStrategy', nodeType: AuthStrategyType }
);
