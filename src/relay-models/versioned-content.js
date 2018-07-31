import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';
import { VersionedContentRecordConnection } from './versioned-content-record';

export const VersionedContentType = new GraphQLObjectType({
  name: 'VersionedContent',
  description:
    'Object that matches a version number with an actual piece of content',
  fields: () => ({
    id: globalIdField('VersionedContent', obj => obj._id),
    latest_version: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    contents: {
      type: VersionedContentRecordConnection
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: VersionedContentConnection
} = connectionDefinitions({
  name: 'VersionedContent',
  nodeType: VersionedContentType
});
