import { GraphQLList, GraphQLString } from 'graphql';

import { UserActivityType } from '../../../relay-models/user-activity';
import { resolveUserActivityCountByDate } from '../../../relay-resolvers/user-resolvers';
import * as inputTypes from '../../input-types';

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
