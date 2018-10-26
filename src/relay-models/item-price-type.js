import { GraphQLFloat, GraphQLObjectType } from 'graphql';

export const ItemPriceType = new GraphQLObjectType({
  name: 'ItemPriceType',
  description: 'Item Price',
  fields: () => ({
    amount: {
      type: GraphQLFloat
    }
  })
});
