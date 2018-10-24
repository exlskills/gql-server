import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';

export const UserOrgType = new GraphQLObjectType({
  name: 'UserOrg',
  description: 'User Organization Roles',
  fields: () => ({
    id: globalIdField('UserOrg', obj => obj._id),
    roles: {
      type: new GraphQLList(GraphQLString)
    },
    roles_id: {
      type: new GraphQLList(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});
