import { GraphQLList, GraphQLString } from 'graphql';

import { UserActivityType } from '../../../relay-models/user-activity-type';
import { resolveUserActivityCountByDate } from '../../../relay-resolvers/user-resolver';
import * as inputTypes from '../../input-types-get-query';

export default {
  type: new GraphQLList(UserActivityType),
  args: {
    dateRange: {
      type: inputTypes.DateRangeType
    },
    activityTypes: {
      type: new GraphQLList(GraphQLString)
    }
  },
  resolve: resolveUserActivityCountByDate
};
