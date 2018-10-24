import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  globalIdField
} from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';
import { SectionCardConnection, SectionCardType } from './section-card-type';
import * as inputTypes from '../relay-queries/input-types-get-query';
import { resolveSectionCards } from '../relay-resolvers/section-card-resolver';
// import { resolveUnitSectionEma } from '../relay-resolvers/ema-resolvers';

export const UnitSectionType = new GraphQLObjectType({
  name: 'UnitSection',
  description: 'Section of an EXLskills unit',
  fields: () => ({
    id: globalIdField('UnitSection', obj => obj._id),
    index: {
      type: GraphQLInt
    },
    title: {
      type: GraphQLString
    },
    headline: {
      type: GraphQLString
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
