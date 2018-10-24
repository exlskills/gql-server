import { GraphQLID, GraphQLNonNull, GraphQLFloat, GraphQLInt } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { CompletionObjType } from '../../relay-models/completion-obj-type';
import { processExamSubmission } from '../../relay-mutate-and-get/exam-session-mag';

export default mutationWithClientMutationId({
  name: 'SubmitExam',
  inputFields: {
    exam_session_id: { type: new GraphQLNonNull(GraphQLID) }
  },
  outputFields: {
    final_grade_pct: { type: GraphQLFloat },
    pass_mark_pct: { type: GraphQLInt },
    completionObj: {
      type: CompletionObjType
    }
  },
  mutateAndGetPayload: ({ exam_session_id }, viewer, info) => {
    const localSessionId = fromGlobalId(exam_session_id).id;
    return processExamSubmission(localSessionId, viewer, info).then(
      returnObj => returnObj
    );
  }
});
