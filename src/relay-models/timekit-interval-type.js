import { GraphQLInt, GraphQLString, GraphQLObjectType } from 'graphql';

export const TimekitInterval = new GraphQLObjectType({
  name: 'TimekitInterval',
  description: '',
  fields: () => ({
    credits: {
      type: GraphQLInt
    },
    duration_seconds: {
      type: GraphQLInt
    },
    project_id: {
      type: GraphQLString
    }
  })
});
