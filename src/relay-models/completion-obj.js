import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql';

export const CompletionObjType = new GraphQLObjectType({
  name: 'CompletionObj',
  description: 'Operation Completion Report',
  fields: () => ({
    code: {
      type: GraphQLString
    },
    msg: {
      type: GraphQLString
    },
    msg_id: {
      type: GraphQLString
    },
    processed: {
      type: GraphQLInt
    },
    modified: {
      type: GraphQLInt
    }
  })
});
