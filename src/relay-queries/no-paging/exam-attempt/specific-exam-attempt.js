import { GraphQLString, GraphQLList } from 'graphql';
import { ExamAttemptType } from '../../../relay-models/exam-attempt';
import { resolveExamAttempt } from '../../../relay-resolvers/exam-resolvers';

export default {
  type: new GraphQLList(ExamAttemptType),
  args: {
    unit_id: {
      type: GraphQLString
    }
  },
  resolve: resolveExamAttempt
};
