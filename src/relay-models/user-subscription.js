import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const UserSubscriptionType = new GraphQLObjectType({
  name: 'UserSubscription',
  description:
    'The users subscription level. All users have this field -- they then vary by their level',
  fields: () => ({
    id: globalIdField('UserSubscription', obj => obj._id),
    level: {
      type: new GraphQLNonNull(GraphQLInt)
    }
    // TODO finalize against Zoho -- payment field, duration, free trials etc.
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: UserSubscriptionConnection
} = connectionDefinitions({
  name: 'UserSubscription',
  nodeType: UserSubscriptionType
});
