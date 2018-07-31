import { GraphQLObjectType } from 'graphql';
import { connectionArgs } from 'graphql-relay';

import { UserNotificationConnection } from '../../relay-models';
import { resolveNotifications } from '../../relay-resolvers/notification-resolvers';
import * as inputTypes from '../input-types';

export const notificationPaging = {
  type: new GraphQLObjectType({
    name: 'notificationPaging',
    fields: {
      notifications: {
        type: UserNotificationConnection,
        args: {
          orderBy: {
            type: inputTypes.OrderByType
          },
          filterValues: {
            type: inputTypes.FilterValuesType
          },
          resolverArgs: {
            type: inputTypes.QueryResolverArgsType
          },
          ...connectionArgs
        },
        resolve: resolveNotifications
      }
    }
  }),
  description: 'Notifications for the logged in user',
  resolve: (obj, args, viewer, info) => Promise.resolve({})
};
