import { connectionArgs } from 'graphql-relay';
import * as inputTypes from '../../input-types-get-query';
import { QuestionType } from '../../../relay-models';
import { resolveGetQuestionHint } from '../../../relay-resolvers/question-resolver';

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
    resolveGetQuestionHint(obj, args, viewer, info)
};
