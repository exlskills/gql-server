import { GraphQLFloat, GraphQLString, GraphQLBoolean, GraphQLObjectType } from 'graphql';

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
    },
    is_hidden: {
      type: GraphQLBoolean
    },
    closes_at: {
      type: GraphQLString
    },
    opens_at: {
      type: GraphQLString
    },
    is_shipping_required: {
      type: GraphQLBoolean
    }
  })
});
