import { connectionArgs } from 'graphql-relay';

import * as inputTypes from '../input-types-get-query';

import { DigitalDiplomaConnection } from '../../relay-models';

import { resolveListDigitalDiplomas } from '../../relay-resolvers/digital-diploma-resolver';

export const listDigitalDiplomas = {
  type: DigitalDiplomaConnection,
  description: 'all DigitalDiplomas in the database',
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
    resolveListDigitalDiplomas(obj, args, viewer, info)
};
