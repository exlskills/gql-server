import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionArgs, connectionDefinitions } from 'graphql-relay';

import { CourseConnection } from './course';
import { NodeInterface } from './node-definitions';

export const PathType = new GraphQLObjectType({
  name: 'Path',
  description: 'EXLskills path',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    headline: {
      type: new GraphQLNonNull(GraphQLString)
    },
    description: {
      type: new GraphQLNonNull(GraphQLString)
    },
    organization_ids: {
      type: new GraphQLList(GraphQLID)
    },
    primary_locale: {
      type: GraphQLString
    },
    logo_url: {
      type: new GraphQLNonNull(GraphQLString)
    },
    cover_url: {
      type: new GraphQLNonNull(GraphQLString)
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    is_organization_only: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    subscription_level: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    courses: {
      type: CourseConnection,
      args: {
        ...connectionArgs
      },
      resolve: (obj, args, viewer, info) => null, //Todo
      description: 'Courses'
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: PathConnection } = connectionDefinitions({
  name: 'Path',
  nodeType: PathType
});
