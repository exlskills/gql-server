import { GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

import { connectionArgs } from 'graphql-relay';

import * as inputTypes from '../input-types';

import { ActivityConnection } from '../../relay-models';

import { resolveActivities } from '../../relay-resolvers/activity-resolvers';

export const listActivities = {
  type: ActivityConnection,
  description: 'Activities',
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
    activityTypes: {
      type: inputTypes.ListArgType
    },
    listTypes: {
      type: new GraphQLList(GraphQLString)
    },
    dateRange: {
      type: inputTypes.DateRangeType
    },
    ...connectionArgs
  },

  resolve: (obj, args, viewer, info) =>
    resolveActivities(obj, args, viewer, info)
};
