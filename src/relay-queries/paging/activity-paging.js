import { GraphQLObjectType } from 'graphql';

import { connectionArgs } from 'graphql-relay';

import * as inputTypes from '../input-types';

import { ActivityConnection } from '../../relay-models';

import { resolveActivities } from '../../relay-resolvers/activity-resolvers';

export const activityPaging = {
  type: new GraphQLObjectType({
    name: 'activityPaging',
    fields: {
      activities: {
        type: ActivityConnection,
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
        resolve: resolveActivities
      }
    }
  }),
  description: 'Activities',
  resolve: (obj, args, viewer, info) => Promise.resolve({})
};
