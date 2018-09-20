import { GraphQLInt, GraphQLObjectType } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';

export const ItemPriceType = new GraphQLObjectType({
  name: 'ItemPriceType',
  description: 'Item Price',
  fields: () => ({
    id: globalIdField('ItemPrice', obj => obj._id),
    amount: {
      type: GraphQLInt
    }
  }),
  interfaces: [NodeInterface]
});
