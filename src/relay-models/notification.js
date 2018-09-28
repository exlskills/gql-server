import { GraphQLID, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { UserNotificationConnection } from './user-notification';
import { NodeInterface } from './node-definitions';

export const NotificationType = new GraphQLObjectType({
  name: 'Notification',
  description: '',
  fields: () => ({
    id: globalIdField('Notification', obj => obj._id),
    user_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    notifications: {
      type: new GraphQLNonNull(UserNotificationConnection)
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: NotificationConnection } = connectionDefinitions(
  { name: 'Notification', nodeType: NotificationType }
);
