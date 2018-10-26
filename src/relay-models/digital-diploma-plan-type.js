import { GraphQLFloat, GraphQLString, GraphQLObjectType } from 'graphql';

export const DigitalDiplomaPlan = new GraphQLObjectType({
  name: 'DigitalDiplomaPlan',
  description: '',
  fields: () => ({
    _id: {
      type: GraphQLString
    },
    title: {
      type: GraphQLString
    },
    headline: {
      type: GraphQLString
    },
    cost: {
      type: GraphQLFloat
    }
  })
});
