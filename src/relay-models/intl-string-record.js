import {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const IntlStringRecordType = new GraphQLObjectType({
  name: 'IntlStringRecord',
  description: 'Represents a localized string mapping for one `Locale`',
  fields: () => ({
    locale: {
      type: new GraphQLNonNull(GraphQLString)
    },
    is_default: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
  //, interfaces: [NodeInterface]
});

/*
export const {
  connectionType: IntlStringRecordConnection
} = connectionDefinitions({
  name: 'IntlStringRecord',
  nodeType: IntlStringRecordType
});
*/
