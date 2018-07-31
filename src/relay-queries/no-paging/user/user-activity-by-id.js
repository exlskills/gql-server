import { GraphQLList, GraphQLString } from 'graphql';
import { UserActivityType } from '../../../relay-models/user-activity';
import { resolveUserActivitiesById } from '../../../relay-resolvers/user-resolvers';
export default {
  type: new GraphQLList(UserActivityType),
  args: {
    user_id: {
      type: GraphQLString
    },
    start_date: {
      type: GraphQLString
    },
    end_date: {
      type: GraphQLString
    }
  },
  resolve: resolveUserActivitiesById
};
