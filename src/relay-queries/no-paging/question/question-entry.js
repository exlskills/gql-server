import { connectionArgs } from 'graphql-relay';
import * as inputTypes from '../../input-types';
import { QuestionType } from '../../../relay-models';
import { resolveQuestionEntry } from '../../../relay-resolvers/question-resolvers';

export default {
  type: QuestionType,
  description: 'Question Entry',
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
    resolveQuestionEntry(obj, args, viewer, info)
};
