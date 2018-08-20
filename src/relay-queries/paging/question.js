import { connectionArgs } from 'graphql-relay';
import * as inputTypes from '../input-types';
import { QuestionConnection } from '../../relay-models';
import {
  resolveGetQuestion,
  resolveGetQuestionByExam
} from '../../relay-resolvers/question-resolvers';
import { logger } from '../../utils/logger';

export const questionPaging = {
  type: QuestionConnection,
  description: 'get Question by Unit',
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
    resolveGetQuestion(obj, args, viewer, info)
};
export const questionPagingExam = {
  type: QuestionConnection,
  description: 'get Question by Exam',
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
    resolveGetQuestionByExam(obj, args, viewer, info)
};
