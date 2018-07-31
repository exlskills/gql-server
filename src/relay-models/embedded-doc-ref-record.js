import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const EmbeddedDocRefRecordType = new GraphQLObjectType({
  name: 'EmbeddedDocRefRecord',
  description: '',
  fields: () => ({
    id: globalIdField('EmbeddedDocRefRecord', obj => obj._id),
    level: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    doc_id: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: EmbeddedDocRefRecordConnection
} = connectionDefinitions({
  name: 'EmbeddedDocRefRecord',
  nodeType: EmbeddedDocRefRecordType
});
