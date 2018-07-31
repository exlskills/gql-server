import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const UserOrganizationRoleType = new GraphQLObjectType({
  name: 'UserOrganizationRole',
  description: 'Defines a users role in an organization',
  fields: () => ({
    id: globalIdField('UserOrganizationRole', obj => obj._id),
    organization_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    role: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: UserOrganizationRoleConnection
} = connectionDefinitions({
  name: 'UserOrganizationRole',
  nodeType: UserOrganizationRoleType
});
