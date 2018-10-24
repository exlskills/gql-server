import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';

export const VersionedContentRecordType = new GraphQLObjectType({
  name: 'VersionedContentRecord',
  description:
    'Object that matches a version number with an actual piece of content',
  fields: () => ({
    id: globalIdField('VersionedContentRecord', obj => obj._id),
    version: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: VersionedContentRecordConnection
} = connectionDefinitions({
  name: 'VersionedContentRecord',
  nodeType: VersionedContentRecordType
});
