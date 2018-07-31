import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const OrganizationType = new GraphQLObjectType({
  name: 'Organization',
  description: 'Organization',
  fields: () => ({
    id: globalIdField('Organization', obj => obj._id),
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    headline: {
      type: new GraphQLNonNull(GraphQLString)
    },
    username: {
      type: new GraphQLNonNull(GraphQLString)
    },
    description: {
      type: new GraphQLNonNull(GraphQLString)
    },
    primary_locale: {
      type: new GraphQLNonNull(GraphQLString)
    },
    avatar_url: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: OrganizationConnection
} = connectionDefinitions({ name: 'Organization', nodeType: OrganizationType });
