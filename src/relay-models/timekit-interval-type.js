import { GraphQLFloat, GraphQLInt, GraphQLString, GraphQLObjectType } from 'graphql';

export const TimekitInterval = new GraphQLObjectType({
  name: 'TimekitInterval',
  description: '',
  fields: () => ({
    credits: {
      type: GraphQLFloat
    },
    duration_seconds: {
      type: GraphQLInt
    },
    project_id: {
      type: GraphQLString
    }
  })
});
