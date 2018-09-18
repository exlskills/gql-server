import { GraphQLInt, GraphQLObjectType } from 'graphql';

export const EventDurationType = new GraphQLObjectType({
  name: 'EventDuration',
  description: 'Event Duration',
  fields: () => ({
    months: {
      type: GraphQLInt
    },
    weeks: {
      type: GraphQLInt
    },
    days: {
      type: GraphQLInt
    },
    hours: {
      type: GraphQLInt
    },
    minutes: {
      type: GraphQLInt
    }
  })
});
