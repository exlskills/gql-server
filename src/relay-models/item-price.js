import { GraphQLInt, GraphQLObjectType } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';

export const ItemPriceType = new GraphQLObjectType({
  name: 'ItemPriceType',
  description: 'Item Price',
  fields: () => ({
    amount: {
      type: GraphQLInt
    }
  })
});
