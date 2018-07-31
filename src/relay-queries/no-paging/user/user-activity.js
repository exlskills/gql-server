import { GraphQLList, GraphQLString } from 'graphql';

import { UserActivityType } from '../../../relay-models/user-activity';
import { resolveUserActivities } from '../../../relay-resolvers/user-resolvers';

export default {
  type: new GraphQLList(UserActivityType),
  args: {
    start_date: {
      type: GraphQLString
    },
    end_date: {
      type: GraphQLString
    }
  },
  resolve: resolveUserActivities
};
