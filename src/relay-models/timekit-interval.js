import { GraphQLInt, GraphQLString, GraphQLObjectType } from 'graphql';

import { EmbeddedDocRefRecordConnection } from './embedded-doc-ref-record';

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
