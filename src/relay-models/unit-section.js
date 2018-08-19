import {
  GraphQLFloat,
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

import { NodeInterface } from './node-definitions';
import { SectionCardConnection, SectionCardType } from './section-card';
import * as inputTypes from '../relay-queries/input-types';
import * as courseResolvers from '../relay-resolvers/course-resolvers';
import { resolveSectionCards } from '../relay-resolvers/section-card-resolvers';

export const UnitSectionType = new GraphQLObjectType({
  name: 'UnitSection',
  description: 'Section of an EXLskills unit',
  fields: () => ({
    id: globalIdField('UnitSection', obj => obj._id),
    index: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    headline: {
      type: new GraphQLNonNull(GraphQLString)
    },
    ema: {
      type: GraphQLFloat
    },
    cards_list: {
      type: new GraphQLList(SectionCardType)
    },
    cards: {
      type: SectionCardConnection,
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
        resolveSectionCards(obj, args, viewer, info),
      description: 'Section cards'
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: UnitSectionConnection } = connectionDefinitions({
  name: 'UnitSection',
  nodeType: UnitSectionType
});
