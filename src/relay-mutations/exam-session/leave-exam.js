import { GraphQLID, GraphQLNonNull } from 'graphql';

import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import { CompletionObjType } from '../../relay-models/completion-obj';

import { leaveExam } from '../../relay-mutate-and-get/exam-attempt-mag';

export default mutationWithClientMutationId({
  name: 'LeaveExam',
  inputFields: {
    exam_session_id: { type: new GraphQLNonNull(GraphQLID) }
  },
  outputFields: {
    completionObj: {
      type: CompletionObjType,
      resolve: ({ returnObj }, viewer, info) => returnObj.completionObj
    }
  },
  mutateAndGetPayload: ({ exam_session_id }, viewer, info) => {
    const localId = fromGlobalId(exam_session_id).id;
    return leaveExam(localId, false, viewer, info).then(returnObj => ({
      returnObj
    }));
  }
});
