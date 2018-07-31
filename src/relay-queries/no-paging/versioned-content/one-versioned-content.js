import { GraphQLString, GraphQLNonNull } from 'graphql';

import { VersionedContentRecordType } from '../../../relay-models/versioned-content-record';
import { getOneVersionedContentRecord } from '../../../relay-resolvers/versioned-content-resolvers';

export const oneVersionedContent = {
  type: VersionedContentRecordType,
  description: 'Content Latest Version',
  args: {
    content_id: {
      type: new GraphQLNonNull(GraphQLString)
    },
    version: {
      type: GraphQLString
    }
  },
  resolve: (_, args, viewer, info) =>
    getOneVersionedContentRecord(args, viewer, info)
};
