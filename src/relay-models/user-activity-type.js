import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import { globalIdField } from 'graphql-relay';

export const UserActivityType = new GraphQLObjectType({
  name: 'UserActivity',
  description: 'Defines a user’s activity which are pre-calculated',
  fields: () => ({
    id: globalIdField('UserActivity', obj => obj.date), // NOTE: There is no id field
    date: {
      type: new GraphQLNonNull(GraphQLString)
    },
    count: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  })
});
