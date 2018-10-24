import { connectionArgs } from 'graphql-relay';
import * as inputTypes from '../input-types-get-query';
import { QuestionConnection } from '../../relay-models';
import {
  resolveGetQuestion,
  resolveGetQuestionsForExam
} from '../../relay-resolvers/question-resolver';
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
  description: 'get Questions For Exam',
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
    resolveGetQuestionsForExam(obj, args, viewer, info)
};
