import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  globalIdField
} from 'graphql-relay';

import { CourseUnitConnection } from './course-unit';

import { NodeInterface } from './node-definitions';

import { resolveCourseUnits } from '../relay-resolvers/course-unit-resolvers';
import * as inputTypes from '../relay-queries/input-types';

export const CourseType = new GraphQLObjectType({
  name: 'Course',
  description: 'EXLskills course',
  fields: () => ({
    id: globalIdField('Course', obj => obj._id),
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
    units: {
      type: CourseUnitConnection,
      args: {
        orderBy: {
          type: inputTypes.OrderByType
        },
        filterValues: {
          type: inputTypes.FilterValuesType
        },
        resolverArgs: {
          type: inputTypes.QueryResolverArgsType
        },
        ...connectionArgs
      },
      resolve: (obj, args, viewer, info) =>
        resolveCourseUnits(obj, args, viewer, info),
      description: 'Course units'
    },
    topics: {
      type: new GraphQLList(GraphQLString)
    },
    enrolled_count: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    view_count: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    info_md: {
      type: new GraphQLNonNull(GraphQLString)
    },
    repo_url: {
      type: GraphQLString
    },
    verified_cert_cost: {
      type: GraphQLFloat
    },
    skill_level: {
      type: GraphQLInt
    },
    est_minutes: {
      type: GraphQLInt
    },
    primary_topic: {
      type: GraphQLString
    },
    last_accessed_at: {
      type: GraphQLString
    },
    last_accessed_unit: {
      type: GraphQLString
    },
    last_accessed_section: {
      type: GraphQLString
    },
    last_accessed_card: {
      type: GraphQLString
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: CourseConnection } = connectionDefinitions({
  name: 'Course',
  nodeType: CourseType
});
