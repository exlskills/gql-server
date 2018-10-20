import { UserConnection } from '../../relay-models';
import * as inputTypes from '../input-types';
import { connectionArgs } from 'graphql-relay';
import { resolveListInstructors } from '../../relay-resolvers/user-resolvers';

export const listInstructors = {
  type: UserConnection,
  description: 'Instructors',
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
    instructorTopics: {
      type: inputTypes.ListArgType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) =>
    resolveListInstructors(obj, args, viewer, info)
};
