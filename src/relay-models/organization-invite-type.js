import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';

export const OrganizationInviteType = new GraphQLObjectType({
  name: 'OrganizationInviteType',
  description: '',
  fields: () => ({
    id: globalIdField('OrganizationInvite', obj => obj._id),
    organization_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    url_key: {
      type: new GraphQLNonNull(GraphQLString)
    },
    user_id: {
      type: GraphQLID
    },
    email: {
      type: new GraphQLNonNull(GraphQLString)
    },
    role: {
      type: GraphQLString
    },
    status: {
      type: new GraphQLNonNull(GraphQLString)
    },
    claimed_at: {
      type: GraphQLString
    },
    expires_at: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: OrganizationInviteConnection
} = connectionDefinitions({
  name: 'OrganizationInvite',
  nodeType: OrganizationInviteType
});
