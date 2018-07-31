import {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const UserNotificationType = new GraphQLObjectType({
  name: 'UserNotification',
  description: 'User notifications',
  fields: () => ({
    id: globalIdField('UserNotification', obj => obj._id),
    actor: {
      type: GraphQLString
    },
    notification_link: {
      type: new GraphQLNonNull(GraphQLString)
    },
    def_id: {
      type: new GraphQLNonNull(GraphQLString)
    },
    is_read: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    created_at: {
      type: new GraphQLNonNull(GraphQLString)
    },
    updated_at: {
      type: new GraphQLNonNull(GraphQLString)
    },
    content: {
      // From list_def
      type: GraphQLString
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: UserNotificationConnection
} = connectionDefinitions({
  name: 'UserNotification',
  nodeType: UserNotificationType
});
