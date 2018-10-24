import { GraphQLString, GraphQLList } from 'graphql';
import { ExamSessionType } from '../../../relay-models/exam-session-type';
import { resolveExamSession } from '../../../relay-resolvers/exam-resolver';

export default {
  type: new GraphQLList(ExamSessionType),
  args: {
    unit_id: {
      type: GraphQLString
    }
  },
  resolve: (obj, args, viewer, info) =>
    resolveExamSession(obj, args, viewer, info)
};
